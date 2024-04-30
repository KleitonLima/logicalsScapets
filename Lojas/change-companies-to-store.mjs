import { readFileSync, writeFile } from "fs";

const databaseCampanies = JSON.parse(
  readFileSync("migrate-data/scapets.companies.json")
);

const storesRemodeled = databaseCampanies.map(
  ({ cnpj, nomeFantasia, razaoSocial, telefoneComercial, image }) => {
    if (image) if (image.slice(-3) !== "jpg") image = null;

    return {
      cnpj: cnpj.$numberLong,
      commision: 15,
      isOpen: false,
      active: false,
      fantasyName: nomeFantasia,
      businessName: razaoSocial,
      phone: telefoneComercial.$numberLong,
      avatar: image,
    };
  }
);

writeFile(
  "archive-remodeled/seed-store.json",
  JSON.stringify(storesRemodeled, null, 2),
  "utf-8",
  (err) => {
    if (err) console.error(`Falha na criação: ${err}`);
    else console.log("Arquivo criado");
  }
);
