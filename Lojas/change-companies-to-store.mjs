import { readFileSync, writeFile } from "fs";

const databaseCampanies = JSON.parse(
  readFileSync("migrate-data/scapets.companies.json")
);

const storesRemodeled = databaseCampanies.map(
  ({
    cnpj,
    comissao,
    estabelecimento_aberto,
    ativo,
    nomeFantasia,
    razaoSocial,
    telefoneComercial,
    image,
  }) => {
    if (estabelecimento_aberto === 1) estabelecimento_aberto = true;
    else estabelecimento_aberto = false;

    if (ativo === 1) ativo = true;
    else ativo = false;

    if (image) if (image.slice(-3) !== "jpg") image = null;

    return {
      cnpj,
      commision: comissao,
      isOpen: estabelecimento_aberto,
      active: ativo,
      fantasyName: nomeFantasia,
      businessName: razaoSocial,
      phone: telefoneComercial,
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
