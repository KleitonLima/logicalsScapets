import { readFileSync, writeFile } from "fs";

const dataCategories = JSON.parse(
  readFileSync("migrate-data/scapets-homologacao.categorias.json")
);

const dataWithoutAnimalTypes = [];

const verifyRepeatedsDescriptions = (dataCategories) => {
  const descricoes = {};
  const dataCategoriesUniques = [];

  dataCategories.forEach((category) => {
    const descricaoLowerCase = category.descricao.toLowerCase();

    if (!descricoes[descricaoLowerCase]) {
      descricoes[descricaoLowerCase] = true;
      dataCategoriesUniques.push(category);
    }
  });

  return dataCategoriesUniques;
};

const uniqueData = verifyRepeatedsDescriptions(dataCategories);

const dataRemodeled = uniqueData
  .map(({ descricao, animalTypeSlug }) => {
    // Remove espaços, letras maiúsculas, hífen
    const regexDescription = descricao
      .normalize("NFD")
      .replace(/[\u0300-\u036f\s]+/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    // Atribui o animalTypesSlug correspondente de acordo com a palavra presente no regexDescription
    if (/(cachorro?|caes?)/.test(regexDescription)) animalTypeSlug = "caes";
    if (/(gato?|gatos?)/.test(regexDescription)) animalTypeSlug = "gatos";
    if (/(peixes?)/.test(regexDescription)) animalTypeSlug = "peixes";
    if (/(passaros?|aquario?)/.test(regexDescription))
      animalTypeSlug = "passaros";
    if (/(roedores?)/.test(regexDescription)) animalTypeSlug = "roedores";
    if (/(repteis?)/.test(regexDescription)) animalTypeSlug = "repteis";

    // Caso não atribua nenhum, envia o objeto para a outra array
    if (!animalTypeSlug)
      return dataWithoutAnimalTypes.push({
        name: descricao,
        slug: regexDescription,
      });

    return {
      name: descricao,
      slug: regexDescription,
      animalTypeSlug,
    };
  })
  .filter(
    // Retira somente as categorias que contenham animalTypes definido
    (item) => typeof item === "object" && item !== null && !Array.isArray(item)
  );

writeFile(
  "archives-remodeleds/seed-category-with-animal-types.json",
  JSON.stringify(dataRemodeled, null, 2),
  "utf8",
  (err) => {
    if (err) console.error(`Falha na criação: ${err}`);
    else console.log("Arquivo criado");
  }
);

writeFile(
  "archives-remodeleds/seed-category-without-animal-types.json",
  JSON.stringify(dataWithoutAnimalTypes, null, 2),
  "utf8",
  (err) => {
    if (err) console.error(`Falha na criação: ${err}`);
    else console.log("Arquivo criado");
  }
);
