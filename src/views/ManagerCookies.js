
import Cookies from 'js-cookie';


export const createCookie = (key,value)=>{
    Cookies.set(key, value, {
        expires: 7, 
        sameSite: 'None', 
        secure: true 
    });
}
export const getCookie = (key)=>Cookies.get(key)

export const deleteCookie = (key)=>{
    Cookies.remove(key,{ 
        sameSite: 'None', 
        secure: true 
    })
}
