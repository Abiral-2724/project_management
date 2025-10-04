function decodeJwtPayload(token : any) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = atob(base64);
      return JSON.parse(decodedPayload) ;


    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  }

const decodetokenfunction = () => {
    const token = localStorage?.getItem("token") ; 
      const user = decodeJwtPayload(token);
    return user ; 
}

export default decodetokenfunction ; 


 