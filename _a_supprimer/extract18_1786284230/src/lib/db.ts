import "server-only";
import { Pool } from "pg";

/**
 * Couche de persistance PostgreSQL.
 *
 * Toute la logique métier stocke des « documents » JSON (un enregistrement =
 * un objet JS) dans une seule table `documents(collection, id, data jsonb)`.
 * Les fonctions des différents stores (getRequests, addQuote, …) conservent
 * exactement la même signature qu'avant : seule la source de données change
 * (fichiers JSON → PostgreSQL). Aucun écran n'a besoin d'être modifié.
 *
 * Si `DATABASE_URL` n'est pas défini (ex. pendant `next build`, ou mauvaise
 * config), la couche se comporte comme une base vide au lieu de planter :
 * les lectures renvoient [] / null et les écritures sont ignorées. En
 * production sur Coolify, `DATABASE_URL` est fourni et tout devient persistant.
 */

const hasDb = () => Boolean(process.env.DATABASE_URL);

const globalForPool = globalThis as unknown as { _scpPool?: Pool };

function pool(): Pool {
  if (!globalForPool._scpPool) {
    globalForPool._scpPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Postgres interne Coolify : pas de SSL. Mettre DATABASE_SSL=require
      // seulement pour une base managée externe qui l'exige.
      ssl:
        process.env.DATABASE_SSL === "require"
          ? { rejectUnauthorized: false }
          : undefined,
      max: 5,
    });
  }
  return globalForPool._scpPool;
}

let ready: Promise<void> | null = null;
function ensureSchema(): Promise<void> {
  if (!ready) {
    ready = pool()
      .query(
        `CREATE TABLE IF NOT EXISTS documents (
           collection text  NOT NULL,
           id         text  NOT NULL,
           data       jsonb NOT NULL,
           seq        bigserial,
           PRIMARY KEY (collection, id)
         );
         CREATE INDEX IF NOT EXISTS documents_collection_seq
           ON documents (collection, seq);`,
      )
      .then(() => undefined)
      .catch((e) => {
        // Réinitialise pour retenter au prochain appel plutôt que de rester bloqué.
        ready = null;
        throw e;
      });
  }
  return ready;
}

async function run(text: string, params?: unknown[]) {
  await ensureSchema();
  return pool().query(text, params as unknown[]);
}

/** Liste tous les documents d'une collection (plus récents d'abord par défaut). */
export async function listDocs<T>(
  collection: string,
  newestFirst = true,
): Promise<T[]> {
  if (!hasDb()) return [];
  const r = await run(
    `SELECT data FROM documents WHERE collection = $1
       ORDER BY seq ${newestFirst ? "DESC" : "ASC"}`,
    [collection],
  );
  return r.rows.map((row) => row.data as T);
}

/** Récupère un document par id (ou null). */
export async function getDoc<T>(
  collection: string,
  id: string,
): Promise<T | null> {
  if (!hasDb()) return null;
  const r = await run(
    `SELECT data FROM documents WHERE collection = $1 AND id = $2`,
    [collection, id],
  );
  return (r.rows[0]?.data as T) ?? null;
}

/** Insère (ou remplace) un document complet. */
export async function putDoc<T>(
  collection: string,
  id: string,
  data: T,
): Promise<void> {
  if (!hasDb()) return;
  await run(
    `INSERT INTO documents (collection, id, data)
       VALUES ($1, $2, $3::jsonb)
     ON CONFLICT (collection, id)
       DO UPDATE SET data = EXCLUDED.data`,
    [collection, id, JSON.stringify(data)],
  );
}

/** Fusionne un patch partiel (merge superficiel, comme { ...ancien, ...patch }). */
export async function patchDoc<T>(
  collection: string,
  id: string,
  patch: Partial<T>,
): Promise<T | null> {
  if (!hasDb()) return null;
  const r = await run(
    `UPDATE documents SET data = data || $3::jsonb
       WHERE collection = $1 AND id = $2
     RETURNING data`,
    [collection, id, JSON.stringify(patch)],
  );
  return (r.rows[0]?.data as T) ?? null;
}

/** Supprime un document. */
export async function deleteDoc(collection: string, id: string): Promise<void> {
  if (!hasDb()) return;
  await run(`DELETE FROM documents WHERE collection = $1 AND id = $2`, [
    collection,
    id,
  ]);
}

/** Remplace intégralement le contenu d'une collection (transactionnel). */
export async function replaceCollection<T extends { id: string }>(
  collection: string,
  items: T[],
): Promise<void> {
  if (!hasDb()) return;
  await ensureSchema();
  const client = await pool().connect();
  try {
    await client.query("BEGIN");
    await client.query(`DELETE FROM documents WHERE collection = $1`, [
      collection,
    ]);
    for (const it of items) {
      await client.query(
        `INSERT INTO documents (collection, id, data) VALUES ($1, $2, $3::jsonb)`,
        [collection, it.id, JSON.stringify(it)],
      );
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

/** Nombre de documents d'une collection. */
export async function countDocs(collection: string): Promise<number> {
  if (!hasDb()) return 0;
  const r = await run(
    `SELECT COUNT(*)::int AS n FROM documents WHERE collection = $1`,
    [collection],
  );
  return (r.rows[0]?.n as number) ?? 0;
}
