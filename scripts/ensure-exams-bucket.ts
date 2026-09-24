import { EXAMS_BUCKET, supabaseAdminClient } from "@/lib/supabaseAdmin";

/** Cria o bucket privado de exames se ele ainda não existir. Rodar uma vez
 *  (local e depois em cada ambiente novo): `npx tsx --env-file=.env scripts/ensure-exams-bucket.ts` */
async function main() {
  const { data: buckets, error: listError } = await supabaseAdminClient.storage.listBuckets();
  if (listError) throw listError;

  if (buckets.some((b) => b.name === EXAMS_BUCKET)) {
    console.log(`Bucket "${EXAMS_BUCKET}" já existe.`);
    return;
  }

  const { error: createError } = await supabaseAdminClient.storage.createBucket(EXAMS_BUCKET, {
    public: false,
    fileSizeLimit: "10MB",
    allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
  });
  if (createError) throw createError;

  console.log(`Bucket "${EXAMS_BUCKET}" criado (privado, até 10MB, PDF/JPEG/PNG/WEBP).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
