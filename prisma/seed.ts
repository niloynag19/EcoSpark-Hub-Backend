import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Admin User
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ecospark.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@ecospark.com',
      password: hashedPassword,
      role: Role.ADMIN,
      avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=10b981&color=fff',
      bio: 'Platform administrator for EcoSpark Hub',
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // Create Demo Member
  const memberPassword = await bcrypt.hash('member123', 12);
  const member = await prisma.user.upsert({
    where: { email: 'member@ecospark.com' },
    update: {},
    create: {
      name: 'Jane Green',
      email: 'member@ecospark.com',
      password: memberPassword,
      role: Role.MEMBER,
      avatar: 'https://ui-avatars.com/api/?name=Jane+Green&background=059669&color=fff',
      bio: 'Passionate about sustainable living and green energy solutions.',
    },
  });
  console.log(`✅ Demo member created: ${member.email}`);

  // Create Categories
  const categories = [
    { name: 'Energy', slug: 'energy', icon: '⚡' },
    { name: 'Waste', slug: 'waste', icon: '♻️' },
    { name: 'Transportation', slug: 'transportation', icon: '🚲' },
    { name: 'Water', slug: 'water', icon: '💧' },
    { name: 'Agriculture', slug: 'agriculture', icon: '🌾' },
    { name: 'Housing', slug: 'housing', icon: '🏠' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`✅ ${categories.length} categories created`);

  // Create Sample Ideas
  const energyCat = await prisma.category.findUnique({ where: { slug: 'energy' } });
  const wasteCat = await prisma.category.findUnique({ where: { slug: 'waste' } });
  const transportCat = await prisma.category.findUnique({ where: { slug: 'transportation' } });

  if (energyCat && wasteCat && transportCat) {
    const sampleIdeas = [
      {
        title: 'Community Solar Power Grid',
        slug: 'community-solar-power-grid',
        problemStatement: 'Many households cannot afford individual solar panel installations, leaving them dependent on fossil fuel-based electricity.',
        proposedSolution: 'Establish a community-owned solar power grid where residents collectively invest in solar panels installed on shared spaces like community centers and parking lots.',
        description: 'This project proposes a shared solar energy system where community members can buy shares in a collectively owned solar array. The generated electricity is distributed among shareholders, reducing individual electricity bills by up to 40%. The project includes educational workshops on solar energy maintenance and promotes local green jobs.',
        images: ['https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800'],
        isPaid: false,
        status: 'APPROVED' as const,
        upvoteCount: 42,
        downvoteCount: 3,
        commentCount: 8,
        authorId: member.id,
        categoryId: energyCat.id,
      },
      {
        title: 'Zero-Waste Campus Initiative',
        slug: 'zero-waste-campus-initiative',
        problemStatement: 'University campuses generate tons of waste annually, with most ending up in landfills due to poor recycling infrastructure.',
        proposedSolution: 'Implement a comprehensive zero-waste program with smart recycling bins, composting stations, and a campus-wide ban on single-use plastics.',
        description: 'The Zero-Waste Campus Initiative aims to transform educational institutions into models of sustainability. The program includes installing AI-powered sorting bins that guide users on proper waste disposal, setting up composting facilities for food waste from cafeterias, and replacing all single-use items with biodegradable alternatives. Pilot studies show a potential 70% reduction in landfill waste within the first year.',
        images: ['https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800'],
        isPaid: false,
        status: 'APPROVED' as const,
        upvoteCount: 35,
        downvoteCount: 2,
        commentCount: 12,
        authorId: member.id,
        categoryId: wasteCat.id,
      },
      {
        title: 'Electric Bike Sharing Network',
        slug: 'electric-bike-sharing-network',
        problemStatement: 'Urban areas suffer from traffic congestion and air pollution due to over-reliance on personal vehicles for short-distance commutes.',
        proposedSolution: 'Launch an affordable electric bike sharing network with solar-powered charging stations across the city.',
        description: 'This innovative transportation solution provides an eco-friendly alternative for urban commuters. The network features GPS-enabled e-bikes available through a mobile app, with strategically placed solar-powered docking stations. Users can rent bikes for short trips at minimal cost, reducing carbon emissions and traffic congestion. The system includes a gamification element where users earn green points for each ride, redeemable for local business discounts.',
        images: ['https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800'],
        isPaid: true,
        price: 4.99,
        status: 'APPROVED' as const,
        upvoteCount: 28,
        downvoteCount: 5,
        commentCount: 6,
        authorId: member.id,
        categoryId: transportCat.id,
      },
      {
        title: 'Rooftop Garden Revolution',
        slug: 'rooftop-garden-revolution',
        problemStatement: 'Urban food deserts lack access to fresh produce, and concrete rooftops contribute to the urban heat island effect.',
        proposedSolution: 'Convert unused commercial rooftops into community vegetable gardens with rainwater harvesting systems.',
        description: 'The Rooftop Garden Revolution transforms wasted urban spaces into productive green areas. Each garden uses raised beds with organic soil, drip irrigation fed by rainwater collection, and companion planting techniques to maximize yield. Participating buildings see reduced cooling costs by up to 25% while providing fresh, locally grown produce to surrounding neighborhoods.',
        images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800'],
        isPaid: false,
        status: 'APPROVED' as const,
        upvoteCount: 51,
        downvoteCount: 1,
        commentCount: 15,
        authorId: member.id,
        categoryId: energyCat.id,
      },
      {
        title: 'Plastic-Free Ocean Initiative',
        slug: 'plastic-free-ocean-initiative',
        problemStatement: 'Over 8 million tons of plastic enter our oceans each year, threatening marine ecosystems and human health.',
        proposedSolution: 'Deploy autonomous ocean cleanup drones paired with coastal community recycling education programs.',
        description: 'This dual-approach initiative combines technology and community engagement to tackle ocean plastic pollution. Solar-powered cleanup drones patrol coastal waters collecting floating debris, while community workshops teach residents about plastic alternatives and proper waste management. The collected plastic is processed locally into construction materials, creating a circular economy model.',
        images: ['https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800'],
        isPaid: true,
        price: 2.99,
        status: 'APPROVED' as const,
        upvoteCount: 38,
        downvoteCount: 4,
        commentCount: 9,
        authorId: member.id,
        categoryId: wasteCat.id,
      },
      {
        title: 'Green Commuter Rewards Program',
        slug: 'green-commuter-rewards-program',
        problemStatement: 'Despite available public transit, most urban workers still choose personal cars for daily commutes.',
        proposedSolution: 'Create a city-wide rewards program that incentivizes carpooling, biking, and public transit usage with tangible benefits.',
        description: 'The Green Commuter Rewards Program uses a mobile app to track sustainable commuting choices. Users earn points for every mile traveled via bike, bus, train, or carpool. Points are redeemable for tax credits, local business discounts, and priority parking for carpoolers. Employers can participate by offering additional incentives, creating a city-wide movement toward greener commuting habits.',
        images: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800'],
        isPaid: false,
        status: 'UNDER_REVIEW' as const,
        upvoteCount: 0,
        downvoteCount: 0,
        commentCount: 0,
        authorId: member.id,
        categoryId: transportCat.id,
      },
    ];

    for (const idea of sampleIdeas) {
      await prisma.idea.upsert({
        where: { slug: idea.slug },
        update: {},
        create: idea,
      });
    }
    console.log(`✅ ${sampleIdeas.length} sample ideas created`);
  }

  console.log('🌿 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
