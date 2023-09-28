# This file is part of the IOGX template and is documented at the link below:
# https://www.github.com/input-output-hk/iogx#35-nixper-system-outputsnix

{ iogxRepoRoot, repoRoot, inputs, inputs', pkgs, system, lib, projects ? null, ... }:

{
  packages = {
    marlowe-vesting = repoRoot.nix.marlowe-vesting.default;
  };
  # checks = { };
  # apps = { };
  operables = repoRoot.nix.marlowe-vesting.deploy.operable;
  oci-images = repoRoot.nix.marlowe-vesting.deploy.oci-image;
  # nomadTasks = { };
  # foobar = { };
}
