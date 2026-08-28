import fs from 'fs';
import path from 'path';
import { getDbClient } from '../lib/db.js';

const prisma = getDbClient();

const GHOST_PROJECT_SLUGS = [
  'landing-page',
  'amr-mousa0.github.io',
  'amr-mousa0',
  'crm-erb'
];

const CONTENT_DIRS = [
  'src/content/projects/ar',
  'src/content/projects/en'
];

async function main() {
  const args = process.argv.slice(2);
  const isDeleteMode = args.includes('--delete');

  console.log(`\n=== Ghost Projects Cleanup ===`);
  console.log(`Mode: ${isDeleteMode ? 'DELETE' : 'DRY RUN (default)'}\n`);

  try {
    // 1. Find the ghost projects in DB if available
    if (typeof prisma?.project?.findMany === 'function') {
      const ghostProjects = await prisma.project.findMany({
        where: {
          slug: {
            in: GHOST_PROJECT_SLUGS
          }
        }
      });

      if (ghostProjects.length === 0) {
        console.log('No ghost projects found in the database.');
      } else {
        console.log(`Found ${ghostProjects.length} ghost project(s) in DB:`);
        for (const p of ghostProjects) {
          console.log(` - ${p.slug} (ID: ${p.id}, Category: ${p.category})`);
        }
      }

      if (isDeleteMode && ghostProjects.length > 0 && typeof prisma?.project?.deleteMany === 'function') {
        console.log(`\nProceeding to delete ${ghostProjects.length} DB records...`);
        const result = await prisma.project.deleteMany({
          where: {
            slug: {
              in: GHOST_PROJECT_SLUGS
            }
          }
        });
        console.log(`✅ Successfully deleted ${result.count} ghost project record(s) from database.`);
      }
    }

    // 2. Find ghost files on filesystem
    const foundFiles: string[] = [];
    for (const slug of GHOST_PROJECT_SLUGS) {
      for (const dir of CONTENT_DIRS) {
        const filePath = path.join(process.cwd(), dir, `${slug}.md`);
        if (fs.existsSync(filePath)) {
          foundFiles.push(filePath);
        }
      }
    }

    if (foundFiles.length > 0) {
      console.log(`\nFound ${foundFiles.length} ghost markdown file(s) on disk:`);
      for (const f of foundFiles) {
        console.log(` - ${f}`);
      }
    }

    // 3. Delete files if in delete mode
    if (isDeleteMode) {
      if (foundFiles.length > 0) {
        console.log(`\nProceeding to delete ${foundFiles.length} ghost markdown files from disk...`);
        for (const filePath of foundFiles) {
          fs.unlinkSync(filePath);
          console.log(`  ✅ Deleted file: ${filePath}`);
        }
      }
    } else {
      console.log(`\n[WARN] This was a DRY RUN. No records or files were deleted.`);
      console.log(`To actually delete these records and files, run:`);
      console.log(`npx tsx src/scripts/cleanup-rogue-projects.ts --delete\n`);
    }

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    if (typeof prisma?.$disconnect === 'function') {
      await prisma.$disconnect();
    }
  }
}

main();
