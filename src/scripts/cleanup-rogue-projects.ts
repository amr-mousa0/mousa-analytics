import { getDbClient } from '../lib/db.js';

const prisma = getDbClient();

const GHOST_PROJECT_SLUGS = [
  'landing-page',
  'amr-mousa0.github.io',
  // Add other known rogue project slugs here if discovered
];

async function main() {
  const args = process.argv.slice(2);
  const isDeleteMode = args.includes('--delete');

  console.log(`\n=== Ghost Projects Cleanup ===`);
  console.log(`Mode: ${isDeleteMode ? 'DELETE' : 'DRY RUN (default)'}\n`);

  try {
    // 1. Find the ghost projects
    const ghostProjects = await prisma.project.findMany({
      where: {
        slug: {
          in: GHOST_PROJECT_SLUGS
        }
      }
    });

    if (ghostProjects.length === 0) {
      console.log('No ghost projects found in the database. Everything looks clean.');
      return;
    }

    console.log(`Found ${ghostProjects.length} ghost project(s):`);
    for (const p of ghostProjects) {
      console.log(` - ${p.slug} (ID: ${p.id}, Category: ${p.category})`);
    }

    // 2. Delete if in delete mode
    if (isDeleteMode) {
      console.log(`\nProceeding to delete ${ghostProjects.length} records...`);
      const result = await prisma.project.deleteMany({
        where: {
          slug: {
            in: GHOST_PROJECT_SLUGS
          }
        }
      });
      console.log(`✅ Successfully deleted ${result.count} ghost project(s).`);
    } else {
      console.log(`\n⚠️ This was a DRY RUN. No records were deleted.`);
      console.log(`To actually delete these records, run the script with the --delete flag:`);
      console.log(`npx tsx src/scripts/cleanup-rogue-projects.ts --delete\n`);
    }

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
