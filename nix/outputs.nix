{ repoRoot, inputs, pkgs, lib, system }:

[
  {
    devShells.default = repoRoot.nix.shell;

    packages.marlowe-token-plans = repoRoot.nix.marlowe-vesting;

    hydraJobs.devShells.default = repoRoot.nix.shell;
    hydraJobs.marlowe-vesting = repoRoot.nix.marlowe-vesting;
    hydraJobs.required = lib.iogx.mkHydraRequiredJob { };
  }
]
