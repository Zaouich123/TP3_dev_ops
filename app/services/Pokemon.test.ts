import { describe, test, expect, beforeEach, vi } from "vitest";
import { PokemonService } from "~/services/PokemonService";
import { PokeApiClient } from "~/services/PokeApiClient";
import { Pokemon } from "~/services/pokemon";

vi.mock("~/services/PokeApiClient");

describe("PokemonService", () => {
  let pokeApiClient: PokeApiClient;
  let pokemonService: PokemonService;

  beforeEach(() => {
    pokeApiClient = new PokeApiClient();
    pokemonService = new PokemonService(pokeApiClient);
  });

  const mockPokemon: Pokemon = {
    id: 1,
    name: "Bulbasaur",
    sprite: "bulbasaur.png",
    types: ["grass", "poison"],
  };

  describe("getPokemonList", () => {
    test("doit retourner une liste de pokemons à partir du client API", async () => {
      const mockPokemonList: Pokemon[] = [mockPokemon];
      vi.spyOn(pokeApiClient, "getPokemonList").mockResolvedValue(
        mockPokemonList,
      );

      const result = await pokemonService.getPokemonList();
      expect(result).toEqual(mockPokemonList);
      expect(pokeApiClient.getPokemonList).toHaveBeenCalledOnce();
    });
  });

  describe("getUserTeam", () => {
    test("doit retourner un tableau vide si l'utilisateur n'a pas d'équipe", () => {
      const userId = "user1";
      const result = pokemonService.getUserTeam(userId);
      expect(result).toEqual([]);
    });

    test("doit retourner l'équipe de l'utilisateur si elle existe", () => {
      const userId = "user1";
      const team: Pokemon[] = [mockPokemon];
      pokemonService["userTeams"].set(userId, team);

      const result = pokemonService.getUserTeam(userId);
      expect(result).toEqual(team);
    });
  });

  describe("clearTeam", () => {
    test("doit vider l'équipe de l'utilisateur", () => {
      const userId = "user1";
      pokemonService["userTeams"].set(userId, [mockPokemon]);

      pokemonService.clearTeam(userId);
      expect(pokemonService.getUserTeam(userId)).toEqual([]);
    });
  });

  describe("togglePokemonInTeam", () => {
    const userId = "user1";

    test("doit ajouter un pokemon à l'équipe de l'utilisateur s'il n'est pas déjà présent", () => {
      const result = pokemonService.togglePokemonInTeam(userId, mockPokemon);
      expect(result).toBe(true);
      expect(pokemonService.getUserTeam(userId)).toEqual([mockPokemon]);
    });

    test("doit retirer un pokemon de l'équipe de l'utilisateur s'il est déjà présent", () => {
      pokemonService["userTeams"].set(userId, [mockPokemon]);

      const result = pokemonService.togglePokemonInTeam(userId, mockPokemon);
      expect(result).toBe(true);
      expect(pokemonService.getUserTeam(userId)).toEqual([]);
    });

    test("ne doit pas ajouter un pokemon si l'équipe a déjà 6 membres", () => {
      const team: Pokemon[] = Array.from({ length: 6 }, (_, i) => ({
        id: i + 1,
        name: `Pokemon${i + 1}`,
        sprite: `sprite${i + 1}.png`,
        types: ["type1"],
      }));
      pokemonService["userTeams"].set(userId, team);

      const result = pokemonService.togglePokemonInTeam(userId, mockPokemon);
      expect(result).toBe(false);
      expect(pokemonService.getUserTeam(userId)).toEqual(team);
    });
  });
});
