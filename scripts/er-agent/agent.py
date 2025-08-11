import os
import re
from typing import List, Dict, Any, Optional
from pathlib import Path
import asyncio
import argparse

from dotenv import load_dotenv



from langchain.prompts import ChatPromptTemplate, PromptTemplate
from langchain.schema import Document
from langchain.chains import LLMChain
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_community.llms import OpenAI
from langchain_community.chat_models import ChatOpenAI
from langchain.text_splitter import RecursiveCharacterTextSplitter



class TypeORMEntityLoader:

    def __init__(self, entity_directory: str):
        self.entity_directory = entity_directory

    def load_entities(self) -> List[Document]:
        print("Step 1: Loading TypeORM entity files from", self.entity_directory)
        entity_docs = []
        for root, _, files in os.walk(self.entity_directory):
            for file in files:
                if file.endswith(".ts"):
                    full_path = os.path.join(root, file)
                    try:
                        with open(full_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            if self._is_entity_file(content):
                                cleaned = self._clean_entity_content(content)
                                entity_docs.append(Document(page_content=cleaned, metadata={"source": full_path}))
                    except Exception:
                        continue
        return entity_docs
    
    def _is_entity_file(self, content: str) -> bool:
        # Check if the content contains the @Entity decorator
        return '@Entity' in content or 'extends BaseEntity' in content
    
    def _clean_entity_content(self, content: str) -> str:
        # Remove comments and unnecessary whitespace
        content = re.sub(r'//.*', '', content)
        content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
        content = re.sub(r'\n\s*\n', '\n', content)
        
        return content.strip()

class ERDiagramAgent:

    def __init__(self, entity_directory: str, google_api_key: str):
        self.google_api_key = google_api_key
        self.entity_directory = entity_directory
        
        # Initialize components
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': 'cpu'}, 
            encode_kwargs={'normalize_embeddings': True}
        )
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0,
            max_tokens=None,
            timeout=None,
            max_retries=2,
            google_api_key=google_api_key
        )
        self.entity_loader = TypeORMEntityLoader(entity_directory)
        self.vectorstore = None
        
        # Initialize prompts
        self._setup_prompts()

    def _setup_prompts(self):

        self.sql_prompt = ChatPromptTemplate.from_template("""
            You are a database expert. Based on the following TypeORM entity definitions, generate the corresponding SQL CREATE TABLE statements.

            Entity Definitions:
            {entity_content}

            Requirements:
            1. Generate clean, standard SQL CREATE TABLE statements
            2. Include all columns with appropriate data types (INT, VARCHAR, TEXT, DATETIME, etc.)
            3. Define primary keys (PRIMARY KEY), foreign keys (FOREIGN KEY REFERENCES), and indexes
            4. Handle TypeORM relationships:
            - @OneToMany/@ManyToOne: Create foreign key relationships
            - @ManyToMany: Create junction tables
            - @JoinColumn: Use specified column names
            5. Convert TypeORM decorators to SQL:
            - @PrimaryGeneratedColumn() → AUTO_INCREMENT PRIMARY KEY
            - @Column() → appropriate column definition
            - @CreateDateColumn() → DATETIME DEFAULT CURRENT_TIMESTAMP
            - @UpdateDateColumn() → DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            6. Keep enum definitions for the next step
            7. Create your own join table for ma many-to-many relationships
            Generate only the SQL CREATE TABLE statements:
        """)

        self.mermaid_prompt = ChatPromptTemplate.from_template("""
    You are a diagram expert. Convert the following SQL schema into a Mermaid ER diagram.

    SQL Schema:
    {sql_content}

    Requirements:
    1. Use proper Mermaid ER diagram syntax
    2. Show all entities (tables) and their attributes with data types
    3. Display relationships with correct cardinality notation:
    - ||--|| : one to one
    - ||--o{{ : one to many
    - }}o--o{{ : many to many
    4. Mark primary keys with "PK", foreign keys with "FK", unique keys with "UK"
    5. Also, describe each field as Mermaid comment. For enums, describe enum using definition from top of the file. Additionally, field properties like nullable, default values has to be described in the field description.
    6. Join table if present, hass to be created between many-to-many relationships
    7. Use this exact format:

    ```mermaid
    erDiagram
      
        USER {{
            int id PK
            string email UK
            string name
            datetime created_at
            datetime updated_at
        }}
        ORDER {{
            int id PK
            int user_id FK
            decimal total
            datetime created_at "field description"
        }}
        PROFILE {{
            int id PK
            int user_id FK
            string bio "field description"
        }}
        PRODUCT {{
            int id PK
            string name
            decimal price "field description"
        }}
                                                                 USER ||--o{{ ORDER : places
        USER ||--|| PROFILE : has
        ORDER }}o--o{{ PRODUCT : contains
        
        ```
                                                        
      
        Generate the complete Mermaid ER diagram:
        """)
    
        self.factcheck_prompt = ChatPromptTemplate.from_template("""
        You are a Mermaid diagram validator. Analyze the following Mermaid ER diagram for syntax errors and rendering issues.

        Mermaid Diagram:
        {mermaid_content}

        Check for these common issues:
        1. Proper Mermaid ER diagram syntax (starts with "erDiagram")
        2. Correct relationship notation (||--||, ||--o{{, }}o--o{{)
        3. Valid attribute definitions with proper brackets {{}}
        4. Correct entity naming (no spaces, valid identifiers)
        5. Proper PK/FK/UK annotations
        6. Missing or extra brackets, colons, or symbols
        7. Valid Mermaid syntax that will render without errors

        Response format:
        - If the diagram is correct and will render properly: respond with exactly "VALID"
        - If there are errors: provide the corrected Mermaid diagram in the same format

        Analysis result:
        """)

    async def setup_embeddings(self):
        """Load entity files and create embeddings"""
        print("Loading TypeORM entity files...")
        documents = self.entity_loader.load_entities()
        
        if not documents:
            raise ValueError(f"No TypeORM entity files found in {self.entity_directory}")
        
        print(f"Found {len(documents)} entity files")
        
        # Split documents for better embedding
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,  # Smaller chunks for free models
            chunk_overlap=100,
            separators=["\n\n", "\n", " ", ""]
        )
        
        split_docs = text_splitter.split_documents(documents)
        
        print("Creating embeddings with HuggingFace model...")
        self.vectorstore = FAISS.from_documents(split_docs, self.embeddings)
        
        return len(split_docs)

    async def generate_sql_from_entities(self, query: str = "Generate SQL for all entities") -> str:
        """Generate SQL CREATE statements from entity embeddings"""
        if not self.vectorstore:
            await self.setup_embeddings()
        
        # Retrieve relevant entity content
        relevant_docs = self.vectorstore.similarity_search(query, k=8)  # Gemini can handle more context
        entity_content = "\n\n".join([doc.page_content for doc in relevant_docs])
        
        if len(entity_content) > 8000:
            entity_content = entity_content[:8000] + "\n... (truncated)"
        
        # Generate SQL
        sql_chain = LLMChain(llm=self.llm, prompt=self.sql_prompt)
        result = await sql_chain.arun(entity_content=entity_content)
        
        return result

    async def generate_mermaid_from_sql(self, sql_content: str) -> str:
        
        if len(sql_content) > 6000:
            sql_content = sql_content[:6000] + "\n... (truncated)"
            
        mermaid_chain = LLMChain(llm=self.llm, prompt=self.mermaid_prompt)
        result = await mermaid_chain.arun(sql_content=sql_content)
        
        return result
    
    async def factcheck_mermaid(self, mermaid_content: str) -> str:
        """Fact-check and validate Mermaid diagram"""
        factcheck_chain = LLMChain(llm=self.llm, prompt=self.factcheck_prompt)
        result = await factcheck_chain.arun(mermaid_content=mermaid_content)
        
        return result
    
    async def generate_er_diagram(self, query: str = "Generate ER diagram for all entities") -> Dict[str, Any]:
        """Complete pipeline to generate ER diagram"""
        try:
            print("Step 1: Setting up embeddings...")
            if not self.vectorstore:
                await self.setup_embeddings()
            
            print("Step 2: Generating SQL from entities...")
            sql_content = await self.generate_sql_from_entities(query)
            
            print("Step 3: Generating Mermaid diagram from SQL...")
            mermaid_content = await self.generate_mermaid_from_sql(sql_content)
            
            print("Step 4: Fact-checking Mermaid diagram...")
            validation_result = await self.factcheck_mermaid(mermaid_content)
            
            # If validation suggests corrections, use them
            final_mermaid = mermaid_content
            if validation_result.strip() != "VALID":
                if "```mermaid" in validation_result:
                    # Extract corrected diagram
                    corrected = re.search(r'```mermaid\n(.*?)\n```', validation_result, re.DOTALL)
                    if corrected:
                        final_mermaid = f"```mermaid\n{corrected.group(1)}\n```"
            
            return {
                "sql": sql_content,
                "mermaid": final_mermaid,
                "validation": validation_result,
                "status": "success"
            }
            
        except Exception as e:
            return {
                "error": str(e),
                "status": "error"
            }
        
    def save_results(self, results: Dict[str, Any], output_dir: str = "output"):
        """Save generated results to files"""
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        if results["status"] == "success":
            # Save SQL
            with open(output_path / "schema.sql", "w") as f:
                f.write(results["sql"])
            
            # Save Mermaid
            with open(output_path / "diagram.md", "w") as f:
                f.write(results["mermaid"])
            
            # Save validation report
            with open(output_path / "validation.txt", "w") as f:
                f.write(results["validation"])
            
            print(f"Results saved to {output_dir}/")
        else:
            print(f"Error: {results['error']}")
    

def find_entity_root(src_path: str) -> str:
    """
    Recursively search for TypeORM entity files and return the top-most directory containing them.
    """
    entity_dirs = set()
    for root, _, files in os.walk(src_path):
        for file in files:
            if file.endswith(".ts"):
                try:
                    full_path = os.path.join(root, file)
                    with open(full_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        if '@Entity' in content or 'extends BaseEntity' in content:
                            entity_dirs.add(root)
                except Exception:
                    continue

    # Return the shallowest entity directory
    if entity_dirs:
        return sorted(entity_dirs, key=lambda d: d.count(os.sep))[0]
    return src_path


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--src", required=True)
    args = parser.parse_args()

    load_dotenv(dotenv_path=Path(__file__).parent / ".env.local")
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise EnvironmentError("Missing GOOGLE_API_KEY")

    agent = ERDiagramAgent(args.src, api_key)
    results = await agent.generate_er_diagram()
    agent.save_results(results)


if __name__ == "__main__":
    asyncio.run(main())
