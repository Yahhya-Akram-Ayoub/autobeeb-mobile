# react-native-esoftplay-images-picker
react native multi image picker


## INSTALATION
```
npm install --save react-native-esoftplay-images-picker
```

## USAGE
```
import ImagesPicker from 'react-native-esoftplay-images-picker

...
<ImagesPicker
  images={(images)=>console.log(images)}
  max={3}
  color={colorPrimary}
  show={this.state.showImagesPicker}
  dismiss={()=>this.setState({showImagesPicker:false})}
```

## PROPS
```
  images  = funtion   = A callback to receive images selection 
  max     = number    = maximum count images selection
  color   = string    = color code for ImagesPicker
  show    = boolean   = determine ImagesPicker show or not
  dismiss = function  = function to make props.show = false
```
