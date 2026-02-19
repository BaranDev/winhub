import { exec } from "child_process";
import util from "util";
import { ServiceResult } from '../../shared/types';

export interface ChocolateyPackage {
  Id: string;
  Version: string;
  Title: string;
  Description: string;
  Summary: string;
  Authors: string;
  ProjectUrl: string;
  Tags: string;
  DownloadCount: number;
  IsApproved: boolean;
}

// cache results in memory
class ChocoCache {
  private cache = new Map<string, { data: ChocolateyPackage[]; timestamp: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  get(query: string): ChocolateyPackage[] | null {
    const entry = this.cache.get(query.toLowerCase());
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(query.toLowerCase());
      return null;
    }

    return entry.data;
  }

  set(query: string, data: ChocolateyPackage[]): void {
    this.cache.set(query.toLowerCase(), {
      data,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const chocoCache = new ChocoCache();

const execAsync = util.promisify(exec);

// parse name|version from cli
function parseChocoCliOutput(output: string): ChocolateyPackage[] {
  const packages: ChocolateyPackage[] = [];
  const lines = output.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (
      !trimmed ||
      trimmed.startsWith("Chocolatey") ||
      trimmed.includes("packages found.")
    ) {
      continue;
    }

    const parts = trimmed.split("|");
    if (parts.length >= 2) {
      const id = parts[0].trim();
      const version = parts[1].trim();

      packages.push({
        Id: id,
        Version: version,
        Title: id,
        Description: `${id} package from Chocolatey`, // cli limit-output has no descriptions
        Summary: "",
        Authors: "",
        ProjectUrl: "",
        Tags: "",
        DownloadCount: 0,
        IsApproved: true,
      });
    }
  }

  return packages;
}

// search packages via cli
export async function searchChocolateyPackages(
  query: string,
  page: number = 0,
  limit: number = 20,
): Promise<ServiceResult<ChocolateyPackage[]>> {
  if (!query || query.trim().length === 0) {
    return {
      success: false,
      error: { message: "Search query cannot be empty" },
    };
  }

  const trimmedQuery = query.trim();
  const cacheKey = `${trimmedQuery}_${page}_${limit}`;

  // check cache
  const cachedResult = chocoCache.get(cacheKey);
  if (cachedResult) {
    return { success: true, data: cachedResult };
  }

  try {
    // use manual slice for pagination for now
    const command = `choco search "${trimmedQuery}" --limit-output --yes`;

    console.log(`Executing Chocolatey CLI: ${command}`);

    const { stdout, stderr } = await execAsync(command, { timeout: 15000 });

    if (stderr && stderr.trim().length > 0 && !stderr.includes("warn")) {
      console.warn(`Chocolatey CLI stderr: ${stderr.trim()}`);
    }

    const allPackages = parseChocoCliOutput(stdout);

    // slice for pagination
    const skip = page * limit;
    const packages = allPackages.slice(skip, skip + limit);

    console.log(
      `Chocolatey CLI search returned ${allPackages.length} total, sending ${packages.length} for page ${page}`,
    );

    // cache results
    chocoCache.set(cacheKey, packages);

    return {
      success: true,
      data: packages,
      total: allPackages.length,
    };
  } catch (error) {
    console.error("Chocolatey CLI search error:", error);

    let errorMessage = "Failed to search Chocolatey packages";
    if (error instanceof Error) {
      if (error.message.includes("Command failed")) {
        errorMessage = "Chocolatey CLI command failed (is choco installed?)";
      } else if (error.message.includes("killed")) {
        errorMessage = "Chocolatey CLI search timed out";
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: {
        message: errorMessage,
        code: "CHOCO_CLI_ERROR",
      },
    };
  }
}

// helper to build install command
export function generateChocoCommand(
  packageId: string,
  version?: string,
): string {
  if (!packageId || packageId.trim().length === 0) return "";

  const baseCommand = `choco install ${packageId.trim()} -y`;
  if (version && version.trim().length > 0) {
    return `${baseCommand} --version=${version.trim()}`;
  }
  return baseCommand;
}

// clear the cache
export function clearChocoCache(): void {
  chocoCache.clear();
}
