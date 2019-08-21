var app = {
  initialize: function () {
    this.bindEvents();
  },
  bindEvents: function () {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },
  onDeviceReady: function () {
    var button = document.getElementById("take_pictures");
    button.addEventListener("click", takePictures);
  }
};

app.initialize();

function takePictures() {
  navigator.camera.getPicture(cameraSuccess, cameraError, { quality: 80, destinationType: Camera.DestinationType.DATA_URL });
}
function cameraSuccess(image) {
  var img = document.getElementById("image");
  img.src = "data:image/jpeg;base64," + image;
}
function cameraError(message) {
  alert("error!: " + message);
}