import { PermissionsAndroid } from 'react-native';



const requestCameraPermission = async () => {
    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
                title: 'Cool Photo App Camera Permission',
                message:
                    'Cool Photo App needs access to your camera ' +
                    'so you can take awesome pictures.',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('You can use the camera');
            return true;
        } else {
            console.log('Camera permission denied');
        }
    } catch (err) {
        console.warn(err);
    }
    return false;
};


export { requestCameraPermission };