self: { lib, config, pkgs, ... }:
let
  inherit (lib) mkOption types mapAttrs';

  inherit (pkgs) writeTextDir symlinkJoin;

  tokenPlansOptions = { name, ... }: {
    options = {
      domain = mkOption {
        type = types.str;
        default = name;
        description = "The domain to host marlowe-token-plans";
      };

      # TODO local or remote
      runtime-instance = mkOption {
        type = types.str;
        description = "The name of the runtime instance to connect to";
      };

      flake = mkOption {
        type = types.attrs;
        default = self;
        description = "A Nix Flake containing the token plans application";
      };
    };
  };

  mkRoot = name: { runtime-instance, flake, ... }:
    let
      configJson = writeTextDir "config.json" (builtins.toJSON {
        marloweWebServerUrl = "//${config.marlowe.runtimes.${runtime-instance}.domain}";
        develMode = false;
      });
    in
    symlinkJoin {
      name = "marlowe-token-plans-${name}-root";
      paths = [
        flake.packages.${pkgs.system}.marlowe-token-plans
        configJson
      ];
    };
in
{
  options = {
    marlowe.token-plans = mkOption {
      type = types.attrsOf (types.submodule tokenPlansOptions);
      default = { };
      description = "Marlowe Token Plans instances to run";
    };
  };
  config = {
    http-services.static-sites = mapAttrs'
      (name: tokenPlan: {
        name = "marlowe-token-plans-${name}";
        value = {
          inherit (tokenPlan) domain;
          root = mkRoot name tokenPlan;
          index-fallback = true;
        };
      })
      config.marlowe.token-plans;
  };
}

