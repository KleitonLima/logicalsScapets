import { readFileSync, writeFile } from "fs";

// #Categorias
const dataCategories = JSON.parse(
  readFileSync("migrate-data/scapets-homologacao.categorias.json")
);

const verifyRepeatedsDescriptions = (dataCategories) => {
  const descricoes = {};
  const dataCategoriesUniques = [];

  dataCategories.forEach((category) => {
    const descricaoLowerCase = category.descricao
      .toLowerCase()
      .replace(/^\s+|\s+$/g, "");

    if (!descricoes[descricaoLowerCase]) {
      descricoes[descricaoLowerCase] = true;
      dataCategoriesUniques.push(category);
    }
  });

  return dataCategoriesUniques;
};

const uniqueCategoryData = verifyRepeatedsDescriptions(dataCategories);
const dataWithoutAnimalTypes = [];

const categoryDataRemodeled = uniqueCategoryData
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
  JSON.stringify(categoryDataRemodeled, null, 2),
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

// #Produtos
const dataBaseProducts = JSON.parse(
  readFileSync("migrate-data/scapets.produtouniques.json")
);

const dataBaseProductsRepeateds = [];

const verifyRepeatedsProducts = (dataBaseProducts) => {
  const dataBaseProductsUniques = [];

  dataBaseProducts.forEach((product) => {
    const nomeLowerCase = product.nome.trim().toLowerCase();
    const existingProductIndex = dataBaseProductsUniques.findIndex(
      (p) => p.nome.trim().toLowerCase() === nomeLowerCase
    );

    if (existingProductIndex === -1) {
      product.nome = product.nome.trim();

      dataBaseProductsUniques.push(product);
    } else {
      const existingProduct = dataBaseProductsUniques[existingProductIndex];
      if (existingProduct.categoria === product.categoria) {
        product.nome = product.nome.trim();

        dataBaseProductsRepeateds.push({
          nome: product.nome,
          _id: product._id,
        });
      } else {
        existingProduct.nome = product.nome.trim();

        dataBaseProductsRepeateds.push({
          nome: existingProduct.nome,
          _id: existingProduct._id,
          categoria: existingProduct.categoria,
        });
      }
    }
  });

  return dataBaseProductsUniques;
};

const uniqueProductData = verifyRepeatedsProducts(dataBaseProducts);
const productWithoutCategory = [];

const productDataRemodeled = uniqueProductData
  .map(
    ({
      _id,
      nome,
      descricao,
      especificacoes,
      imagem,
      categoria,
      status,
      campoBusca,
    }) => {
      // Buscar categorias que tenham id igual ao categoryId do produto
      const idMatch = uniqueCategoryData.find((e) => {
        if (e._id && categoria) {
          if (categoria["$oid"] === e._id["$oid"]) {
            categoria = e.descricao
              .normalize("NFD")
              .replace(/[\u0300-\u036f\s]+/g, "")
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "");

            return true;
          }
        } else return false;
      });

      // Se o não existe categoria com id correspondente, envia o produto para outra lista
      if (!idMatch) return productWithoutCategory.push({ nome, _id });

      imagem = [imagem];
      if (especificacoes) especificacoes = [especificacoes];
      else especificacoes = [];

      return {
        name: nome,
        description: descricao,
        specifications: especificacoes,
        categorySlug: categoria,
        status,
        keyword: campoBusca,
        images: imagem,
      };
    }
  )
  .filter(
    (item) => typeof item === "object" && item !== null && !Array.isArray(item)
  );

writeFile(
  "archives-remodeleds/products-repeateds.json",
  JSON.stringify(dataBaseProductsRepeateds, null, 2),
  "utf8",
  (err) => {
    if (err) console.error(`Falha na criação: ${err}`);
    else console.error("Arquivo criado");
  }
);

writeFile(
  "archives-remodeleds/seed-base-product.json",
  JSON.stringify(productDataRemodeled, null, 2),
  "utf8",
  (err) => {
    if (err) console.error(`Falha na criação: ${err}`);
    else console.error("Arquivo criado");
  }
);

writeFile(
  "archives-remodeleds/base-product-without-category.json",
  JSON.stringify(productWithoutCategory, null, 2),
  "utf8",
  (err) => {
    if (err) console.error(`Falha na criação: ${err}`);
    else console.error("Arquivo criado");
  }
);
