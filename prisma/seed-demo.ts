// Seed démo étendu — ajoute des entités Phase 2 & 3 par-dessus la base
// générée par prisma/seed.ts (à lancer APRÈS le seed principal).
//
// Crée :
//   - 5 agents Baboo (rôle VISIT_AGENT) répartis sur les grandes villes
//   - 10 packs visites actifs sur des annonces existantes
//   - 20 visites managées à divers statuts (demandées / assignées / complétées)
//   - 3 agences partenaires (PartnerAgency) avec solde
//   - 10 SearchRequests de particuliers
//   - 3 PromoterPacks actifs
//
// Usage : pnpm tsx prisma/seed-demo.ts (après `pnpm db:seed`)

import {
  PrismaClient,
  VisitPackType,
  VisitPackStatus,
  ManagedVisitStatus,
  PromoterPackTier,
  PromoterPackStatus,
  SearchRequestStatus,
  UserRole,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const DEMO_PASSWORD = "baboo-demo-2026";
const hash = bcrypt.hashSync(DEMO_PASSWORD, 10);

const AGENT_SEED = [
  {
    email: "agent.casa@baboo.ma",
    name: "Yassine El Amrani",
    phone: "+212661000001",
    speciality: "BOTH",
    cities: ["casablanca", "mohammedia"],
  },
  {
    email: "agent.rabat@baboo.ma",
    name: "Sarah Benali",
    phone: "+212661000002",
    speciality: "LOCATION",
    cities: ["rabat", "sale"],
  },
  {
    email: "agent.marrakech@baboo.ma",
    name: "Karim Tazi",
    phone: "+212661000003",
    speciality: "VENTE",
    cities: ["marrakech"],
  },
  {
    email: "agent.tanger@baboo.ma",
    name: "Nadia El Fassi",
    phone: "+212661000004",
    speciality: "BOTH",
    cities: ["tanger", "tetouan"],
  },
  {
    email: "agent.agadir@baboo.ma",
    name: "Mehdi Chaoui",
    phone: "+212661000005",
    speciality: "LOCATION",
    cities: ["agadir"],
  },
];

const PARTNER_SEED = [
  {
    name: "Immobilier Casa Anfa",
    contactName: "Omar Bennani",
    contactEmail: "partner.casa@example.com",
    contactPhone: "+212522000001",
    citySlugs: ["casablanca"],
    creditBalance: 5000,
  },
  {
    name: "Rabat Realty Group",
    contactName: "Leïla Bouzid",
    contactEmail: "partner.rabat@example.com",
    contactPhone: "+212537000001",
    citySlugs: ["rabat", "sale"],
    creditBalance: 3000,
  },
  {
    name: "Marrakech Habitats",
    contactName: "Karim Hakim",
    contactEmail: "partner.mrk@example.com",
    contactPhone: "+212524000001",
    citySlugs: ["marrakech"],
    creditBalance: 2500,
  },
];

async function main() {
  console.log("🌱 Seeding Phase 2/3 demo data…");

  // 1) Agents Baboo
  for (const a of AGENT_SEED) {
    const user = await prisma.user.upsert({
      where: { email: a.email },
      create: {
        email: a.email,
        name: a.name,
        phone: a.phone,
        passwordHash: hash,
        role: UserRole.VISIT_AGENT,
        emailVerified: new Date(),
      },
      update: { name: a.name, phone: a.phone },
    });
    await prisma.userRoleGrant.upsert({
      where: { userId_role: { userId: user.id, role: UserRole.VISIT_AGENT } },
      create: {
        userId: user.id,
        role: UserRole.VISIT_AGENT,
        reason: "Seed démo",
      },
      update: {},
    });
    await prisma.visitAgentProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        speciality: a.speciality,
        cityCoverage: a.cities,
        status: "ACTIVE",
        avgRating: 4.5,
        totalVisits: 12,
        completedVisits: 10,
      },
      update: {
        cityCoverage: a.cities,
        speciality: a.speciality,
        status: "ACTIVE",
      },
    });
  }
  console.log(`  ✓ ${AGENT_SEED.length} agents`);

  // 2) Packs visites sur 10 annonces existantes
  const listings = await prisma.listing.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, ownerId: true, transaction: true },
    take: 10,
    orderBy: { createdAt: "desc" },
  });
  let packsCreated = 0;
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  for (let i = 0; i < listings.length; i++) {
    const l = listings[i];
    const type: VisitPackType =
      l.transaction === "RENT"
        ? i % 3 === 0
          ? VisitPackType.DECOUVERTE_3
          : i % 3 === 1
          ? VisitPackType.LOCATION_10
          : VisitPackType.LOCATION_25
        : i % 2 === 0
        ? VisitPackType.VENTE_5
        : VisitPackType.VENTE_10;
    const credits =
      type === VisitPackType.DECOUVERTE_3
        ? 3
        : type === VisitPackType.LOCATION_10
        ? 10
        : type === VisitPackType.LOCATION_25
        ? 25
        : type === VisitPackType.VENTE_5
        ? 5
        : 10;
    const price =
      type === VisitPackType.DECOUVERTE_3
        ? 400
        : type === VisitPackType.LOCATION_10
        ? 1200
        : type === VisitPackType.LOCATION_25
        ? 2500
        : type === VisitPackType.VENTE_5
        ? 2500
        : 4500;
    const existing = await prisma.visitPack.findFirst({
      where: { listingId: l.id },
      select: { id: true },
    });
    if (existing) continue;
    await prisma.visitPack.create({
      data: {
        userId: l.ownerId,
        listingId: l.id,
        type,
        status: VisitPackStatus.ACTIVE,
        creditsTotal: credits,
        creditsUsed: Math.floor(credits * 0.2),
        amountPaid: price,
        paymentProvider: "manual",
        paymentReference: `demo-${l.id.slice(-6)}`,
        paidAt: new Date(),
        expiresAt,
      },
    });
    packsCreated++;
  }
  console.log(`  ✓ ${packsCreated} packs visites`);

  // 3) Visites managées à divers statuts (utilisent VisitBooking + ManagedVisit)
  const packs = await prisma.visitPack.findMany({
    where: { status: VisitPackStatus.ACTIVE },
    include: {
      listing: { select: { id: true } },
    },
    take: 10,
  });

  const visitorUser = await prisma.user.upsert({
    where: { email: "demo@baboo.ma" },
    create: {
      email: "demo@baboo.ma",
      name: "Demo Utilisateur",
      phone: "+212600000000",
      passwordHash: hash,
      emailVerified: new Date(),
      role: UserRole.USER,
    },
    update: {},
  });

  const agentUsers = await prisma.user.findMany({
    where: { email: { in: AGENT_SEED.map((a) => a.email) } },
    select: { id: true },
  });

  let managedCreated = 0;
  const statuses: ManagedVisitStatus[] = [
    ManagedVisitStatus.REQUESTED,
    ManagedVisitStatus.ASSIGNED,
    ManagedVisitStatus.CONFIRMED,
    ManagedVisitStatus.COMPLETED,
    ManagedVisitStatus.NO_SHOW,
  ];

  for (let i = 0; i < packs.length * 2; i++) {
    const pack = packs[i % packs.length];
    if (!pack || !pack.listingId) continue;
    const status = statuses[i % statuses.length];
    const startsAt = new Date(Date.now() + (i - 5) * 86_400_000);
    const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);

    const slot = await prisma.visitSlot.create({
      data: {
        listingId: pack.listingId,
        startsAt,
        endsAt,
        maxBookings: 1,
        managedByBaboo: true,
        createdBy: pack.userId,
      },
    });
    const booking = await prisma.visitBooking.create({
      data: {
        slotId: slot.id,
        listingId: pack.listingId,
        visitorUserId: visitorUser.id,
        status:
          status === ManagedVisitStatus.COMPLETED ||
          status === ManagedVisitStatus.NO_SHOW
            ? "COMPLETED"
            : "BOOKED",
        message: "Visite demandée via le pack démo.",
      },
    });

    const agentId = agentUsers[i % agentUsers.length]?.id;
    const isTerminal =
      status === ManagedVisitStatus.COMPLETED ||
      status === ManagedVisitStatus.NO_SHOW;

    await prisma.managedVisit.create({
      data: {
        packId: pack.id,
        bookingId: booking.id,
        agentUserId:
          status === ManagedVisitStatus.REQUESTED ? null : agentId ?? null,
        status,
        assignedAt:
          status === ManagedVisitStatus.REQUESTED ? null : new Date(),
        confirmedAt: [
          ManagedVisitStatus.CONFIRMED,
          ManagedVisitStatus.COMPLETED,
          ManagedVisitStatus.NO_SHOW,
        ].includes(status)
          ? new Date()
          : null,
        completedAt:
          status === ManagedVisitStatus.COMPLETED ? new Date() : null,
        candidatePresented: status === ManagedVisitStatus.COMPLETED,
        candidatePhoneVerified: isTerminal,
        candidateEmploymentVerified:
          status === ManagedVisitStatus.COMPLETED && i % 2 === 0,
        candidateScore:
          status === ManagedVisitStatus.COMPLETED ? (i % 5) + 1 : null,
        candidateNotes:
          status === ManagedVisitStatus.COMPLETED
            ? "Candidat ponctuel, dossier complet présenté sur place."
            : null,
        recommendForLandlord:
          status === ManagedVisitStatus.COMPLETED ? i % 2 === 0 : null,
        reportSubmittedAt: isTerminal ? new Date() : null,
      },
    });
    managedCreated++;
  }
  console.log(`  ✓ ${managedCreated} visites managées`);

  // 4) SearchRequests
  const reqSeed = [
    {
      contactName: "Amina B.",
      email: "amina@example.com",
      phone: "+212611111111",
      transaction: "RENT",
      citySlug: "casablanca",
      propertyType: "APARTMENT",
      budgetMax: 9000,
      minBedrooms: 2,
      minSurface: 70,
      timeline: "month",
    },
    {
      contactName: "Jalil K.",
      email: "jalil@example.com",
      phone: "+212622222222",
      transaction: "SALE",
      citySlug: "rabat",
      propertyType: "VILLA",
      budgetMax: 4500000,
      minBedrooms: 4,
      minSurface: 250,
      timeline: "quarter",
    },
    {
      contactName: "Hajar T.",
      email: "hajar@example.com",
      phone: "+212633333333",
      transaction: "RENT",
      citySlug: "marrakech",
      propertyType: "HOUSE",
      budgetMax: 12000,
      minBedrooms: 3,
      minSurface: 120,
      timeline: "flexible",
    },
  ];
  let reqCreated = 0;
  for (const r of reqSeed) {
    const exists = await prisma.searchRequest.findFirst({
      where: { contactEmail: r.email },
      select: { id: true },
    });
    if (exists) continue;
    await prisma.searchRequest.create({
      data: {
        contactName: r.contactName,
        contactEmail: r.email,
        contactPhone: r.phone,
        transaction: r.transaction,
        citySlug: r.citySlug,
        neighborhoodSlugs: [],
        propertyType: r.propertyType,
        budgetMax: r.budgetMax,
        minBedrooms: r.minBedrooms,
        minSurface: r.minSurface,
        timeline: r.timeline,
        consentGiven: true,
        status: SearchRequestStatus.ACTIVE,
        matchedListingIds: [],
      },
    });
    reqCreated++;
  }
  console.log(`  ✓ ${reqCreated} search requests`);

  // 5) PartnerAgency
  for (const p of PARTNER_SEED) {
    await prisma.partnerAgency.upsert({
      where: { contactEmail: p.contactEmail },
      create: p,
      update: p,
    });
  }
  console.log(`  ✓ ${PARTNER_SEED.length} agences partenaires`);

  // 6) PromoterPack (s'il y a des developers)
  const developers = await prisma.developer.findMany({
    take: 3,
    include: { projects: { take: 2, select: { id: true } } },
  });
  let promoterCreated = 0;
  for (let i = 0; i < developers.length; i++) {
    const dev = developers[i];
    const tier = (
      [
        PromoterPackTier.DECOUVERTE,
        PromoterPackTier.CROISSANCE,
        PromoterPackTier.SUR_MESURE,
      ] as const
    )[i % 3];
    const exists = await prisma.promoterPack.findFirst({
      where: { developerId: dev.id, status: PromoterPackStatus.ACTIVE },
      select: { id: true },
    });
    if (exists) continue;
    const pack = await prisma.promoterPack.create({
      data: {
        developerId: dev.id,
        tier,
        status: PromoterPackStatus.ACTIVE,
        amountMonthly:
          tier === PromoterPackTier.DECOUVERTE
            ? 25000
            : tier === PromoterPackTier.CROISSANCE
            ? 60000
            : 0,
        projectsIncluded: tier === PromoterPackTier.CROISSANCE ? 3 : 1,
        managedVisitsIncluded:
          tier === PromoterPackTier.DECOUVERTE ? 5 : 20,
        featuredOnHomepage: tier !== PromoterPackTier.DECOUVERTE,
        contractStart: new Date(),
        contractEnd: new Date(Date.now() + 365 * 86_400_000),
        totalVisitsDelivered: 12,
        totalLeadsDelivered: 8,
      },
    });
    // rattacher les projets du dev au pack
    if (dev.projects.length > 0) {
      await prisma.project.updateMany({
        where: { id: { in: dev.projects.map((p) => p.id) } },
        data: { promoterPackId: pack.id },
      });
    }
    promoterCreated++;
  }
  console.log(`  ✓ ${promoterCreated} promoter packs`);

  console.log("✅ Seed démo Phase 2/3 complete.");
  console.log("");
  console.log("🔑 Comptes agents (mot de passe : baboo-demo-2026) :");
  AGENT_SEED.forEach((a) => console.log(`   ${a.email} — ${a.name}`));
  console.log("🔑 Agences partenaires (email-based, contact ops pour lien) :");
  PARTNER_SEED.forEach((p) => console.log(`   ${p.contactEmail} — ${p.name}`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
