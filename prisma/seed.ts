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

  // Create Demo Member (Author of ideas)
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

  // Create Demo Buyer (for testing payment flow — NOT an author)
  const buyerPassword = await bcrypt.hash('buyer123', 12);
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@ecospark.com' },
    update: {},
    create: {
      name: 'Alex Rivera',
      email: 'buyer@ecospark.com',
      password: buyerPassword,
      role: Role.MEMBER,
      avatar: 'https://ui-avatars.com/api/?name=Alex+Rivera&background=6366f1&color=fff',
      bio: 'Eco-enthusiast and early adopter of sustainable innovations.',
    },
  });
  console.log(`✅ Demo buyer created: ${buyer.email} (use this to test payment flow)`);

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
        title: 'Vertical Hydroponic Farm',
        slug: 'vertical-hydroponic-farm',
        problemStatement: 'Traditional agriculture uses excessive land and water, and transportation costs increase carbon footprints.',
        proposedSolution: 'Build modular vertical farms in urban centers using hydroponic systems and LED lighting.',
        description: 'Vertical hydroponic farms allow for year-round crop production in the heart of cities. Using 90% less water than traditional farming and zero soil, these systems can be installed in old warehouses or shipping containers. Fresh greens can be delivered to local markets within hours of harvest, drastically reducing food miles and waste.',
        images: ['https://images.unsplash.com/photo-1558449197-5788cd9248fd?w=800'],
        isPaid: false,
        status: 'APPROVED' as const,
        upvoteCount: 45,
        downvoteCount: 2,
        commentCount: 7,
        authorId: member.id,
        categoryId: energyCat.id,
      },
      {
        title: 'Smart Water Leak Detector',
        slug: 'smart-water-leak-detector',
        problemStatement: 'Millions of gallons of water are lost daily due to undetected pipe leaks in residential and commercial buildings.',
        proposedSolution: 'An AI-powered IoT device that monitors water flow patterns and alerts owners of potential leaks via mobile app.',
        description: 'This smart device attaches to main water lines and uses ultrasonic sensors to detect even the smallest leaks. The companion app provides real-time usage data and can automatically shut off the water valve if a major burst is detected. It helps households save up to 15% on water bills while preventing costly water damage.',
        images: ['https://images.unsplash.com/photo-1585706569097-bd15214674b7?w=800'],
        isPaid: true,
        price: 3.99,
        status: 'APPROVED' as const,
        upvoteCount: 32,
        downvoteCount: 1,
        commentCount: 4,
        authorId: member.id,
        categoryId: energyCat.id,
      },
      {
        title: 'Biodegradable Packaging from Seaweed',
        slug: 'biodegradable-packaging-seaweed',
        problemStatement: 'Single-use plastic packaging takes hundreds of years to decompose and pollutes our oceans.',
        proposedSolution: 'Mass-produce packaging materials derived from seaweed that decompose naturally in weeks.',
        description: 'Seaweed-based packaging is a sustainable alternative to plastic. It is fully compostable, edible, and requires no fertilizers or fresh water to grow. This project explores scaling the production of seaweed film for food wraps and sachets, providing a zero-waste solution for the fast-moving consumer goods industry.',
        images: ['https://images.unsplash.com/photo-1605600611284-19561ad7ddf1?w=800'],
        isPaid: false,
        status: 'APPROVED' as const,
        upvoteCount: 58,
        downvoteCount: 0,
        commentCount: 19,
        authorId: member.id,
        categoryId: wasteCat.id,
      },
      {
        title: 'Community Tool Library',
        slug: 'community-tool-library',
        problemStatement: 'Individual ownership of infrequently used tools leads to resource waste and financial burden for low-income families.',
        proposedSolution: 'Establish a neighborhood tool library where residents can borrow high-quality tools for home repairs and gardening.',
        description: 'The Community Tool Library promotes the sharing economy by providing access to drills, saws, lawnmowers, and more. Members pay a small annual fee to borrow tools, reducing the need for everyone to buy their own. This initiative encourages DIY home improvements, strengthens community bonds, and reduces the environmental impact of manufacturing redundant products.',
        images: ['https://images.unsplash.com/photo-1530124560676-1adc22467d02?w=800'],
        isPaid: false,
        status: 'APPROVED' as const,
        upvoteCount: 22,
        downvoteCount: 1,
        commentCount: 5,
        authorId: member.id,
        categoryId: wasteCat.id,
      },
      {
        title: 'Solar-Powered Desalination Plant',
        slug: 'solar-desalination-plant',
        problemStatement: 'Freshwater scarcity is a critical issue for many coastal regions, but traditional desalination is energy-intensive and expensive.',
        proposedSolution: 'Utilize concentrated solar power to drive high-efficiency reverse osmosis desalination.',
        description: 'This project proposes a small-scale, modular desalination plant powered entirely by solar energy. By using concentrated solar thermal collectors to pre-heat water and photovoltaic panels to power high-pressure pumps, we can significantly reduce the cost and carbon footprint of producing clean drinking water from the sea.',
        images: ['https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800'],
        isPaid: true,
        price: 9.99,
        status: 'APPROVED' as const,
        upvoteCount: 64,
        downvoteCount: 3,
        commentCount: 21,
        authorId: member.id,
        categoryId: energyCat.id,
      },
      {
        title: 'Urban Bee Corridor',
        slug: 'urban-bee-corridor',
        problemStatement: 'Declining pollinator populations threaten food security and biodiversity in urban environments.',
        proposedSolution: 'Create a network of wildflower patches and bee hotels across city rooftops and balconies to provide a safe passage for pollinators.',
        description: 'The Urban Bee Corridor initiative aims to reconnect fragmented pollinator habitats. By providing subsidized wildflower seeds and "bee hotel" kits to urban residents, we can create a continuous path of food and shelter for bees and butterflies. This improves local biodiversity and enhances the health of urban gardens and parks.',
        images: ['https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800'],
        isPaid: false,
        status: 'APPROVED' as const,
        upvoteCount: 47,
        downvoteCount: 2,
        commentCount: 11,
        authorId: member.id,
        categoryId: energyCat.id,
      },
      {
        title: 'Circular Fashion Exchange',
        slug: 'circular-fashion-exchange',
        problemStatement: 'The "fast fashion" industry is one of the world\'s largest polluters, with millions of tons of clothing ending up in landfills annually.',
        proposedSolution: 'A digital marketplace and physical pop-up shops dedicated to high-quality clothing repair, upcycling, and swapping.',
        description: 'The Circular Fashion Exchange encourages consumers to extend the life of their garments. The platform connects users with local tailors for repairs, offers tutorials on upcycling old clothes, and hosts curated swap events. By shifting the focus from consumption to maintenance and reuse, we can significantly reduce the textile industry\'s environmental footprint.',
        images: ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800'],
        isPaid: false,
        status: 'APPROVED' as const,
        upvoteCount: 52,
        downvoteCount: 2,
        commentCount: 25,
        authorId: member.id,
        categoryId: wasteCat.id,
      },
      {
        title: 'Modular Electric Vehicle Batteries',
        slug: 'modular-ev-batteries',
        problemStatement: 'The high cost and long charging times of EV batteries remain a barrier to widespread adoption.',
        proposedSolution: 'Standardize modular battery packs that can be quickly swapped at automated stations.',
        description: 'Modular EV batteries allow for a "battery-as-a-service" model. Instead of waiting hours to charge, drivers can pull into a station and have their depleted battery pack swapped for a fully charged one in under 3 minutes. This reduces the initial cost of EVs (since batteries can be leased) and eliminates range anxiety.',
        images: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800'],
        isPaid: true,
        price: 7.99,
        status: 'APPROVED' as const,
        upvoteCount: 41,
        downvoteCount: 8,
        commentCount: 18,
        authorId: member.id,
        categoryId: transportCat.id,
      },
      {
        title: 'Micro-Hydro Power for Rural Streams',
        slug: 'micro-hydro-rural',
        problemStatement: 'Remote rural communities often lack reliable electricity, yet many are located near small, constant-flow streams.',
        proposedSolution: 'Install low-impact micro-hydroelectric generators that provide constant power without the need for large dams.',
        description: 'Micro-hydro systems use the natural flow of small streams to generate electricity. Unlike large-scale hydro, they require no reservoirs and have minimal impact on local ecosystems. A single unit can provide enough power for several households or a small community center, enabling light, refrigeration, and internet access in off-grid areas.',
        images: ['https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800'],
        isPaid: false,
        status: 'APPROVED' as const,
        upvoteCount: 36,
        downvoteCount: 1,
        commentCount: 9,
        authorId: member.id,
        categoryId: energyCat.id,
      },
      {
        title: 'Smart Waste Sorting System',
        slug: 'smart-waste-sorting',
        problemStatement: 'Manual waste sorting is inefficient and leads to high contamination rates in recycling streams.',
        proposedSolution: 'AI-powered conveyor belts with robotic arms that automatically identify and sort recyclables with 99% accuracy.',
        description: 'This industrial-scale solution uses computer vision and robotic pickers to sort mixed waste. The system identifies different types of plastics, metals, and paper in real-time, ensuring high-purity recycling streams that are more valuable and easier to reprocess.',
        images: ['https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800'],
        isPaid: true,
        price: 12.99,
        status: 'APPROVED' as const,
        upvoteCount: 44,
        downvoteCount: 2,
        commentCount: 13,
        authorId: member.id,
        categoryId: wasteCat.id,
      },
      {
        title: 'Rainwater Harvesting for Skyscrapers',
        slug: 'skyscraper-rainwater-harvesting',
        problemStatement: 'Modern skyscrapers consume vast amounts of potable water for non-potable uses like toilet flushing and irrigation.',
        proposedSolution: 'Integrate massive vertical rainwater collection systems into the building facade and foundations.',
        description: 'By using the large surface area of skyscrapers to collect rainwater, we can meet up to 60% of a building\'s non-potable water needs. The system includes advanced filtration and storage tanks that double as structural mass dampers for seismic stability.',
        images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'],
        isPaid: false,
        status: 'APPROVED' as const,
        upvoteCount: 53,
        downvoteCount: 1,
        commentCount: 16,
        authorId: member.id,
        categoryId: energyCat.id,
      },
      {
        title: 'Sustainable Cold Chain for Vaccines',
        slug: 'sustainable-vaccine-cold-chain',
        problemStatement: 'Up to 25% of vaccines are wasted globally due to breaks in the cold chain, especially in regions with unreliable power.',
        proposedSolution: 'Solar-powered, phase-change material refrigerators that can maintain ultra-low temperatures for days without electricity.',
        description: 'This life-saving innovation uses solar energy to freeze phase-change materials that act as thermal batteries. These units can keep vaccines at critical temperatures even during long power outages or transport through remote areas, ensuring healthcare equity and reducing medical waste.',
        images: ['https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800'],
        isPaid: true,
        price: 15.00,
        status: 'APPROVED' as const,
        upvoteCount: 67,
        downvoteCount: 0,
        commentCount: 22,
        authorId: member.id,
        categoryId: energyCat.id,
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
