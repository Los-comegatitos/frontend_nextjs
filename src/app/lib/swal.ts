import Swal from "sweetalert2";

  

// Characters min: 14, max: 160. Seconds min: 2.5, max: 8 
function getMsgSeconds (str = '') {
  const len = str.length < 14 ? 14 : str.length > 160 ? 160 : str.length;
  const seconds = (( ( len * 55000 ) + 2880000 ) / 1460);
  return Math.round(seconds)
}

export const showSucessAlert = (title: string) => {
  return Swal.fire({
    title,
    toast: true,
    icon: 'success',
    position: "top-end",
    showConfirmButton: false,
    showCloseButton: true,
    timer: getMsgSeconds(title),
    timerProgressBar: true,
  });
};

export const showErrorAlert = (title: string) => {
  return Swal.fire({
    title,
    toast: true,
    icon: 'error',
    position: "top-end",
    showConfirmButton: false,
    showCloseButton: true,
    timer: getMsgSeconds(title),
    timerProgressBar: true,
  });
};

export const showInfoAlert = (title: string) => {
  return Swal.fire({
    title,
    toast: true,
    icon: 'info',
    position: "top-end",
    showConfirmButton: false,
    showCloseButton: true,
    timer: getMsgSeconds(title),
    timerProgressBar: true,
  });
};

