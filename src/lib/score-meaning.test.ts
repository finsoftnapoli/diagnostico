import { describe, expect, it } from "vitest";
import { areaReading, levelEquivalent, levelMix, overallReading, stepsToClose } from "./score-meaning";

describe("lettura dei punteggi in parole", () => {
  it("traduce il punteggio nel livello medio delle pratiche", () => {
    expect(levelEquivalent(0)).toBe("pratiche in media al livello «Informale»");
    expect(levelEquivalent(14)).toMatch(/tra «Informale» e «Di base», più vicine a «Informale»/);
    expect(levelEquivalent(67)).toBe("pratiche in media al livello «Strutturato»");
    expect(levelEquivalent(100)).toBe("pratiche in media al livello «Gestito e migliorato»");
  });
  it("descrive la composizione dei temi per livello", () => {
    expect(levelMix([1, 1, 2])).toBe("Dei tre temi, due sono al livello «Informale» e uno è al livello «Di base»");
    expect(levelMix([1, 1, 1])).toBe("Tutti e tre i temi sono al livello «Informale»");
    expect(levelMix([...Array(17).fill(1), ...Array(6).fill(2), 3])).toBe(
      "Dei 24 temi, 17 sono al livello «Informale», 6 sono al livello «Di base» e 1 è al livello «Strutturato»",
    );
  });
  it("esprime il divario dal riferimento in passi di livello", () => {
    expect(stepsToClose(23, 3)).toBe(2);
    expect(stepsToClose(-5, 3)).toBe(0);
    expect(areaReading(22, 45, [1, 1, 2])).toMatch(/servono circa due passi di livello/);
    expect(areaReading(45, 45, [2, 2, 3])).toMatch(/in linea con il riferimento/);
    expect(areaReading(67, 45, [2, 3, 4])).toMatch(/sopra il riferimento/);
    expect(overallReading(14, 42, [...Array(17).fill(1), ...Array(6).fill(2), 3])[1]).toMatch(/quasi tutti i 24 temi/);
  });
});
