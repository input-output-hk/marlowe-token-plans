{ repoRoot, inputs, pkgs, lib, system }:

lib.iogx.mkShell {

  welcomeMessage = "Marlowe Vesting dApp";

  packages = [
    pkgs.nodejs-18_x
    pkgs.nodejs-18_x.pkgs.webpack
    pkgs.nodejs-18_x.pkgs.webpack-cli
  ];

  preCommit = {
    shellcheck.enable = true;
    nixpkgs-fmt.enable = true;
  };
}
