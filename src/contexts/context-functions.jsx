import axiosApi from '../../axiosApi';

const getPreference = async (modulo, opcion, valorDefault) => {
  const promise = new Promise(async (resolve, reject) => {
    try {
      const url = 'preferences';
      const param = 'anonimo' + '/' + modulo + '/' + opcion
      let res;
      const api = await axiosApi()
      api.get(url + '/' + param).then(
        ({data}) => {
            const {model} = data;
            if(model){
              if (model.valor === undefined || model.valor === null) {
                res = valorDefault;
              }
              else {
                res = model.valor;
              }
              resolve(res);
            }
          }
      ).catch(err => {
        reject(err);
      });
    } catch (err) {
      console.log("ERROR", err);
      reject(err);
    }
  });
  return promise;
}

const setPreference = async (pref) => {
  const url = 'preferences';
  const param = { ...pref, usuarioRed: pref.usuarioRed || 'anonimo', valor: pref.valor.toString() }; /*{usuarioRed: "", modulo = "", opcion: "", descrip: "", valor: ""}*/
  try {
    const api = await axiosApi()
    api.post(url, param);
  } catch (err) {
    console.log("ERROR", err);
  }
}

export { getPreference, setPreference }
