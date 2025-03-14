import BasicBitch from './basicBitch.js';

// Factory for creating different car types
class CarFactory {
    static createCar(type) {
        switch(type.toLowerCase()) {
            case 'basicbitch':
                return new BasicBitch();
            default:
                console.warn(`Car type "${type}" not found, defaulting to BasicBitch`);
                return new BasicBitch();
        }
    }
}

export default CarFactory; 