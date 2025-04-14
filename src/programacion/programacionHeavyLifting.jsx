import axiosApi from "../../axiosApi";

export const getDataGrillaProgra = async (fechaRef, canal, senial, cantidadColumnas, onError, emitido, pautado) => {
  if (fechaRef == undefined || canal == undefined || senial == undefined || cantidadColumnas == undefined)
    return [];
    const api = await axiosApi()
  return new Promise(resolve => {
      if (!(canal === '' || senial === '' || fechaRef.toString() === '' || cantidadColumnas.toString() === '')) {
          let url = 'Programacion/Dias/' + canal.toString() + '/' + senial.toString() + '/' + fechaRef.getFullYear() + '-' + (fechaRef.getMonth() + 1).toString().padStart(2, '0') + '-' + fechaRef.getDate().toString().padStart(2, '0') + '/' + cantidadColumnas.toString() + `?emitido=${emitido ? 1 : 0}&pautado=${pautado ? 1 : 0}`;

          api.get(url)
              .then(res => {
                  var topArray = [];
                  const {data} = res
                  const {model, message} = data;

                  if (!message.success) {
                      onError && onError(message.message)
                      resolve([])
                  }
                  ;
                  //FECHA DE CONTROL
                  let fDesde = global.util.fechaSinHora(fechaRef);
                  let fHasta = global.util.fechaSinHora(global.util.fechaSumaDias(fechaRef, cantidadColumnas));
                  //ARMAR SHOWS POR DÍA
                  for (let f = fDesde; f < fHasta; f = global.util.fechaSumaDias(f, 1)) {
                      let f2 = global.util.fechaHoraFinDia(f);
                      let contador = 1;
                      let subArray = [];
                      model.forEach(show => {
                          if (global.util.fechaSinHora(show.fecha_hora_ini).getTime() === f.getTime() || global.util.fechaSinHora(show.fecha_hora_fin).getTime() === f.getTime()) {
                              if (contador == 1)
                                  show = JSON.parse(JSON.stringify(show));

                              //SÓLO INICIALIZAR Y AGREGAR LOs CAMPOS
                              show.continuacion = false;
                              show.continuara = false;
                              show.fechaColumna = f;
                              show.order = contador;
                              show.continuara = false;
                              let FechaIni = new Date(show.fecha_hora_ini)
                              let FechaFin = new Date(show.fecha_hora_fin)
                              show.continuacion = FechaIni.getTime() < f.getTime();
                              show.continuara = FechaFin.getTime() > f2.getTime() + 1000;
                              show.d1 = show.continuacion ? f : new Date(show.fecha_hora_ini);
                              show.d2 = show.continuara ? f2 : new Date(show.fecha_hora_fin);
                              show.iniHHMM = global.util.fechaHHMM(show.fecha_hora_ini);
                              show.finHHMM = global.util.fechaHHMM(show.fecha_hora_fin);
                              ;

                              subArray.push(show);

                              contador++;
                          }
                      });
                      contador = 1; //RESET CONTADOR
                      topArray.push(subArray);
                  }
                  resolve(topArray);
                  //return (topArray);
              })
              .catch(error => {
                  console.log("ERROR:", error);
                  resolve([]);
                  //return ([]);
              });
      }
  })
}

/**
 * 
 * @param {string} fechaRef Fecha del dia que se quiere la grilla
 * @param {function} onError CB en caso de error del back
 * @param {boolean} emitido valor que indica si incluirlos en la respuesta o no 
 * @param {boolean} pautado valor que indica si incluirlos en la respuesta o no
 * @returns Lista de shows formateados para la grilla
 */
export const getDataGrillaPrograTipoEmi = async (fechaRef, onError, emitido, pautado, channelsGroups) => {
  if (fechaRef == undefined || !channelsGroups.length)
    return [];
    const api = await axiosApi()
  return new Promise(resolve => {
    if (!(fechaRef.toString() === '')) {
      fechaRef = new Date(fechaRef);
      let url = 'Programacion/TipoEmi/' + fechaRef.getFullYear() + '-' + (fechaRef.getMonth() + 1).toString().padStart(2, '0') + '-' + fechaRef.getDate().toString().padStart(2, '0')+`/${channelsGroups && channelsGroups.length ? channelsGroups.join(',') : 'null'}?emitido=${emitido? 1 : 0}&pautado=${pautado? 1 : 0}`;
      api.get(url)
        .then(res => {
          var topArray = [];
          const {data} = res
          const {model, message} = data;
          
          if(!message.success) {
            onError && onError(message.message)
            resolve([])
          };

         if(model){ 
          //ARMAR SHOWS POR DÍA
          let f = fechaRef;
          let f2 = global.util.fechaHoraFinDia(f);
          let contador = 1;
          let subArray = [];
          let prevCanalSenial = '';
          if (model.length > 0) {
            prevCanalSenial = model[0].canal + model[0].senial;
          }
          model.forEach(show => {
            if (global.util.fechaSinHora(show.fecha_hora_ini).getTime() === global.util.fechaSinHora(f).getTime() || global.util.fechaSinHora(show.fecha_hora_fin).getTime() === global.util.fechaSinHora(f).getTime()) {
              if (contador == 1)
                show = JSON.parse(JSON.stringify(show));

              //SÓLO INICIALIZAR Y AGREGAR LOs CAMPOS
              show.continuacion = false;
              show.continuara = false;
              show.fechaColumna = f;
              show.order = contador;
              show.continuara = false;
              let FechaIni = new Date(show.fecha_hora_ini)
              let FechaFin = new Date(show.fecha_hora_fin)
              show.continuacion = FechaIni.getTime() < f.getTime();
              show.continuara = FechaFin.getTime() > f2.getTime() + 1000;
              show.d1 = show.continuacion ? f : new Date(show.fecha_hora_ini);
              show.d2 = show.continuara ? f2 : new Date(show.fecha_hora_fin);
              show.iniHHMM = global.util.fechaHHMM(show.fecha_hora_ini);
              show.finHHMM = global.util.fechaHHMM(show.fecha_hora_fin);;

              if (prevCanalSenial !== show.canal + show.senial) {
                contador = 0; //RESET CONTADOR
                topArray.push(subArray);
                subArray = [];
              }

              subArray.push(show);

              contador++;
              prevCanalSenial = show.canal + show.senial;

            }
          });
          topArray.push(subArray);

          resolve(topArray);
        }}
        )
        .catch(error => {
          onError && onError("There was a connection error. Please try to get the data again.")
          resolve(null);
        });
    }
  })
}



export const getProgramasVigentes = async (progra_codi, onError) => {
  if (progra_codi == undefined)
    return [];

  const reg_exp = new RegExp(/^[CP]{1}[0-9]{6}$|^[0-9]{6}$/i)
  const urlbyType = reg_exp.test(progra_codi) ? 'ProgramasVigentesxMateriales/' : 'ProgramasVigentes/'
    const api = await axiosApi()

  return new Promise(resolve => {
      let url = urlbyType+ progra_codi
      
      api.get(url)
        .then(res => {
          var topArray = [];
          let subArray = [];
          const {data} = res
          const {model, message} = data;

          if(!message.success) {
            onError && onError(message.message)
            resolve([])
          };

          if(!model) resolve([]);
          model.forEach(show => {
              show = JSON.parse(JSON.stringify(show));
              subArray.push(show);
          });
          topArray.push(subArray);

          resolve(topArray);
        })
        .catch(error => {
          resolve([]);
        });
    
  })
}

