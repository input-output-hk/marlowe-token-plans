{ repoRoot, inputs, pkgs, lib, system }:

{
  marlowe-vesting = inputs.std.lib.ops.mkOperable {
    package = repoRoot.nix.marlowe-vesting;
    runtimeInputs = [ pkgs.darkhttpd ];
    runtimeScript = ''
      exec darkhttpd "''${CONFIG_HTML_ROOT:-${repoRoot.nix.marlowe-vesting}}" --port 8080 --mimetypes ${pkgs.mailcap}/etc/mime.types
    '';
  };
}
