import { describe, expect, it } from "vitest";
import { errorText } from "./errors";

describe("kullanıcı dostu hata metni", () => {
  it("Tauri hata nesnesinden yalnızca mesajı çıkarır", () => {
    expect(errorText({ kind: "io", message: "Dosya okunamadı." })).toBe("Dosya okunamadı.");
  });
});
