{ iogxRepoRoot, repoRoot, inputs, inputs', pkgs, system, lib }:

let

  inherit (inputs') self std;
  inherit (std.lib.ops) mkOperable;
  inherit (pkgs) darkhttpd mailcap;

  marlowe-vesting = self.packages.marlowe-vesting;

in

{
  marlowe-vesting = mkOperable {
    package = marlowe-vesting;
    runtimeInputs = [ darkhttpd ];
    runtimeScript = ''
      exec darkhttpd "''${CONFIG_HTML_ROOT:-${marlowe-vesting}}" --port 8080 --mimetypes ${mailcap}/etc/mime.types
    '';
  };
}
