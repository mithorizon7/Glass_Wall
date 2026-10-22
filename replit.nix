{ pkgs }:
let
  # Immutable runtime source from Replit nixmodules a8970e5ae1ec9bcb1865de426b37d74a5957da2b.
  source = builtins.fetchTarball {
    url = "https://github.com/NixOS/nixpkgs/archive/5873d3da531a3a8320c9e639e2147eccbe7f2d0d.tar.gz";
    sha256 = "sha256-Ez3EbOIpR9xODoL4V7zgYSZMYKLjMjNYQKyEu70a6GY=";
  };
  runtimePkgs = import source { system = pkgs.stdenv.hostPlatform.system; };
  runtime = runtimePkgs.nodejs_22;
in
assert runtime.version == "22.23.4";
{
  deps = [ runtime ];
}
