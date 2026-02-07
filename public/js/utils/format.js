export const format = { 
  data(dataString) { 
    if(!dataString) return '-'; 
    return new Date(dataString).toLocaleDateString('pt-BR');
  }, 
  dataHora(dataString){ 
    if(!dataString) return '-'; 
    return new Date(dataString).toLocaleDateString('pt-BR', { 
      day: '2-digit', month: '2-digit', year:'numeric', hour: '2-digit', minute:'2-digit'
    });
  }
};