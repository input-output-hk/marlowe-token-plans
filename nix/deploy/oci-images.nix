{ repoRoot, inputs, pkgs, lib, system }:

let

  images = {
    marlowe-vesting = inputs.std.lib.ops.mkStandardOCI {
      name = "marlowe-vesting";
      operable = repoRoot.nix.deploy.operables.marlowe-vesting;
      uid = "0";
      gid = "0";
      labels = {
        description = "Marlowe Withdraw dApp";
        source = "https://github.com/input-output-hk/marlowe-vesting";
        license = "Apache-2.0";
      };
    };
  };

  forAllImages = f: lib.concatMapStrings (s: s + "\n") (lib.mapAttrsToList f images);

in

images // {
  all = {
    copyToDockerDaemon = inputs.std.lib.ops.writeScript {
      name = "copy-to-docker-daemon";
      text = forAllImages (name: img:
        "${inputs.n2c.packages.skopeo-nix2container}/bin/skopeo --insecure-policy copy nix:${img} docker-daemon:${name}:latest"
      );
    };
  };
}
