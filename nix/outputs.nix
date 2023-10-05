{ repoRoot, inputs, pkgs, lib, system }:

[
  {
    devShells.default = repoRoot.nix.shell;

    packages.marlowe-vesting = repoRoot.nix.marlowe-vesting;
  }
]
