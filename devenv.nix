{
  pkgs,
  lib,
  config,
  ...
}:
{
  # https://devenv.sh/languages/
  languages = {
    javascript = {
      enable = true;
      pnpm.enable = true;
    };
    typescript.enable = true;
  };

  # https://devenv.sh/packages/
  packages = [
    pkgs.nodePackages.typescript-language-server
  ];

  # See full reference at https://devenv.sh/reference/options/
}
