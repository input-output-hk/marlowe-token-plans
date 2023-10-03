{ repoRoot, inputs, pkgs, lib, system }:

[
  {
    devShells.default = repoRoot.nix.shell;

    packages.marlowe-vesting = repoRoot.nix.marlowe-vesting;

    operables = repoRoot.nix.deploy.operables;

    oci-images = repoRoot.nix.deploy.oci-images;
  }
]
