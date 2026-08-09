import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Données de démonstration réalistes (section 67 du brief).
 * Lancer avec : npm run db:seed  (après avoir configuré DATABASE_URL).
 */
async function main() {
  console.log("🌱 Seed Stone Car Prestige…");

  // Paramètres entreprise
  await prisma.businessSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "Stone Car Prestige",
      companyNumber: "BE 0123.456.789",
      vatNumber: "BE0123456789",
      address: "Thuin, Belgique",
      phone: "0499 91 29 32",
      email: "contact@stonecarprestige.be",
      openingHours: {
        lun: "09:00-18:00",
        mar: "09:00-18:00",
        mer: "09:00-18:00",
        jeu: "09:00-18:00",
        ven: "09:00-18:00",
        sam: "09:00-13:00",
        dim: "fermé",
      },
    },
  });

  // Catégories de véhicules (base tarifaire)
  const categories = [
    { key: "citadine", label: "Citadine", order: 1 },
    { key: "berline", label: "Berline", order: 2 },
    { key: "break", label: "Break", order: 3 },
    { key: "suv", label: "SUV", order: 4 },
    { key: "grand-suv", label: "Grand SUV", order: 5 },
    { key: "utilitaire", label: "Utilitaire", order: 6 },
    { key: "sportive", label: "Sportive", order: 7 },
    { key: "exception", label: "Véhicule exceptionnel", order: 8 },
  ];
  for (const c of categories) {
    await prisma.vehicleCategory.upsert({
      where: { key: c.key },
      update: { label: c.label, order: c.order },
      create: c,
    });
  }

  // Prestations d'exemple (modifiables — section 54)
  const services = [
    { name: "Lavage extérieur", durationMin: 45, basePrice: 35 },
    { name: "Lavage intérieur", durationMin: 60, basePrice: 55 },
    { name: "Lavage Premium", durationMin: 90, basePrice: 95 },
    { name: "Nettoyage complet", durationMin: 150, basePrice: 145 },
    { name: "Nettoyage moteur", durationMin: 45, basePrice: 60 },
    { name: "Detailing complet", durationMin: 300, basePrice: 240 },
  ];
  for (const [i, s] of services.entries()) {
    const existing = await prisma.service.findFirst({ where: { name: s.name } });
    if (!existing) {
      await prisma.service.create({
        data: {
          name: s.name,
          durationMin: s.durationMin,
          basePrice: s.basePrice,
          order: i,
          priceMode: s.name === "Detailing complet" ? "A_PARTIR_DE" : "FIXE",
        },
      });
    }
  }

  // Clients + véhicules
  const jean = await prisma.customer.upsert({
    where: { id: "seed-jean" },
    update: {},
    create: {
      id: "seed-jean",
      firstName: "Jean",
      lastName: "Dupont",
      phone: "0499 11 22 33",
      email: "jean.dupont@example.be",
      tag: "REGULIER",
    },
  });

  const berline = await prisma.vehicleCategory.findUnique({
    where: { key: "berline" },
  });

  await prisma.vehicle.upsert({
    where: { id: "seed-bmw" },
    update: {},
    create: {
      id: "seed-bmw",
      make: "BMW",
      model: "M340i",
      plate: "1-ABC-123",
      color: "Noir Saphir",
      categoryId: berline?.id,
      ownerId: jean.id,
    },
  });

  console.log("✅ Seed terminé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
