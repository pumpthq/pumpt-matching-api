var geolib = require('geolib');

const getDistance = ({lat,lng},{lat: lat2, lng: lng2}) => {
  return geolib.getDistance(
    {latitude: lat, longitude: lng},
    {latitude: lat2, longitude: lng2}
  )
};

module.exports = {
  getDistance
}
