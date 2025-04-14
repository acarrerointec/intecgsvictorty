const tipoValues = ["tipoMaterial", "codigo"]
const tipoCheck = ["id", "tipo"]
const tipoList = ["value", "tipo"]

export const getTipoNameUnified = (tipo) => {
    return getTipoNameByCollectionIds(tipo, tipoValues);
}

export const getTipoNameUnifiedCheck = (tipo) => {
    return getTipoNameByCollectionIds(tipo, tipoCheck);
}

export const getTipoNameUnifiedList = (tipo) => {
    return getTipoNameByCollectionIds(tipo, tipoList);
}

const getTipoNameByCollectionIds = (tipo, collectionIds) => {
    if(!tipo) return null;
    return collectionIds.map(v => tipo[v])?.join("-");
}

export const revertTipoNameUnified = (tipoUnified) => {
    const values = tipoUnified.split("-");
    return {tipoMaterial: values[0],codigo: values[1]}
}