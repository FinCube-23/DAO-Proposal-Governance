// pg-schema-export.ts
import { Client } from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import path from 'path';

dotenv.config({ path: '.env.local' });

const databases = [
    {
        name: 'user-management',
        host: process.env.USER_MANAGEMENT_DB_HOST || 'user-management-pgsqldb',
        port: Number(process.env.USER_MANAGEMENT_DB_PORT) || 5432,
        user: process.env.USER_MANAGEMENT_POSTGRES_USER || 'dao',
        password: process.env.USER_MANAGEMENT_POSTGRES_PASSWORD || 'dao123',
        db: process.env.USER_MANAGEMENT_POSTGRES_DB || 'dao_db'
    },
    {
        name: 'dao-service',
        host: process.env.DAO_SERVICE_DB_HOST || 'host.docker.internal',
        port: Number(process.env.DAO_SERVICE_DB_PORT) || 5433,
        user: process.env.DAO_SERVICE_POSTGRES_USER || 'dao',
        password: process.env.DAO_SERVICE_POSTGRES_PASSWORD || 'dao123',
        db: process.env.DAO_SERVICE_POSTGRES_DB || 'dao_db'
    },
    {
        name: 'audit-trail-service',
        host: process.env.AUDIT_TRAIL_DB_HOST || 'host.docker.internal',
        port: Number(process.env.AUDIT_TRAIL_DB_PORT) || 5434,
        user: process.env.AUDIT_TRAIL_POSTGRES_USER || 'dao',
        password: process.env.AUDIT_TRAIL_POSTGRES_PASSWORD || 'dao123',
        db: process.env.AUDIT_TRAIL_POSTGRES_DB || 'dao_db'
    },
];

async function exportSchema(config: typeof databases[0]) {
    const client = new Client({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.db,
    });
    try {
        await client.connect();

        const tables = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  `);

        let dbml = `// DBML export for ${config.name}\n\n`;

        for (const row of tables.rows) {
            const tableName = row.table_name;
            dbml += `Table "${tableName}" {\n`;

            const columns = await client.query(`
  SELECT
    c.column_name,
    c.data_type,
    c.is_nullable,
    (SELECT EXISTS (
      SELECT 1
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = '${tableName}'
        AND tc.constraint_type = 'PRIMARY KEY'
        AND kcu.column_name = c.column_name
    )) AS is_primary,
    (SELECT EXISTS (
      SELECT 1
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = '${tableName}'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = c.column_name
    )) AS is_foreign
  FROM information_schema.columns c
  WHERE c.table_name = '${tableName}';
`);

            for (const col of columns.rows) {
                let dataType = col.data_type === 'USER-DEFINED' ? 'varchar' : col.data_type;
                if (dataType.startsWith('timestamp')) dataType = 'timestamp';
                if (dataType === 'character varying') dataType = 'varchar';
                if (dataType === 'integer') dataType = 'int';
                if (dataType === 'double precision') dataType = 'double';

                let settings = [];
                if (col.is_primary) settings.push('pk');
                if (col.is_foreign) settings.push('ref');
                if (col.is_nullable === 'YES') settings.push('null');

                const settingsStr = settings.length ? ` [${settings.join(', ')}]` : '';
                dbml += `  "${col.column_name}" ${dataType}${settingsStr}\n`;
            }

            dbml += `}\n\n`;
        }

        await client.end();

        fs.writeFileSync(`${config.name}.dbml`, dbml);
        console.log(`Exported ${config.name} to ${config.name}.dbml`);
    } catch (err) {
        console.error(`Error connecting to DB ${err}`);
    }
}

//ConvertExportedschema to ER Diagram


function convertDbmlToSvg(dbmlFile: string) {
    const svgFile = dbmlFile.replace('.dbml', '.svg');
    const cmd = `npx @softwaretechnik/dbml-renderer -i ${dbmlFile} -o ${svgFile}`;

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error rendering ${dbmlFile}:`, stderr);
        } else {
            console.log(`Rendered ER diagram: ${svgFile}`);
        }
    });
}

async function run() {
    for (const config of databases) {
        const fileName = `${config.name}.dbml`;
        await exportSchema(config);
        convertDbmlToSvg(fileName);
    }
}

run();
