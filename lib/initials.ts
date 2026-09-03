/** Iniciais pra avatar a partir de um nome (ex: "Dra. Ana Souza" -> "AS"),
 *  ignorando prefixos como "Dr."/"Dra.". */
export function getInitials(name: string) {
  const words = name.split(" ").filter((w) => w && !w.endsWith("."));
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}
