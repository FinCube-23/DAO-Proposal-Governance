# ER Diagram Visualization Agent with LangChain


##What it does


Asks an LLM (OpenAI via langchain-openai) to infer a logical ER model from entities.ts files.

Exports:



    - schema.sql - sql from entitites

    - diagram.md - ER diagram

    


## How to run

```
conda create -n erviz python=3.11 -y
conda activate erviz
```

```
conda create new_env   # not standard; prefer `-n`, but works in some shells
conda activate new_env
```

```
pip install -r requirements.txt
```


```
python agent.py --src /path/to/src/directory
```