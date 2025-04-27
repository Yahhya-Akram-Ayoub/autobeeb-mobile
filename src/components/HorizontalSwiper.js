import React, { Component } from "react";
import {
  FlatList,
  View,
  TouchableOpacity,
  I18nManager,
  Dimensions,
} from "react-native";
import Entypo from "react-native-vector-icons/Entypo";

class HorizontalSwiper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentIndex: 0,
      width: 0,
      onScrollDisabled: false,
    };
    this.interval = null;
  }
  componentDidMount = () => {
    if (this.props.autoLoop && this.props.data?.length > 1)

      this.interval = setInterval(() => {
        if (this.slider) {
          this.setState(
            {
              currentIndex:
                this.state.currentIndex == this.props.data.length - 1
                  ? 0
                  : this.state.currentIndex + 1,
            },
            () => {
              this.slider.scrollToIndex({
                animated: true,
                index: this.state.currentIndex,
              });
            }
          );
        }
      }, this.props.intervalValue);
  };

  componentWillUnmount = () => {
    if (this.props.autoLoop && this.props.data?.length > 1)
      clearInterval(this.interval);
  };

  resetInterval() {
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      if (this.slider) {
        this.setState(
          {
            currentIndex:
              this.state.currentIndex == this.props.data.length - 1
                ? 0
                : this.state.currentIndex + 1,
            onScrollDisabled: true,
          },
          () => {
            this.slider.scrollToIndex({
              animated: true,
              index: this.state.currentIndex,
            });

            setTimeout(() => {
              this.setState({ onScrollDisabled: false });
            }, 1000);
          }
        );
      }
    }, this.props.intervalValue);
  }

  onPressRight() {
    if (this.state.currentIndex < this.props.data.length - 1 && this.slider) {
      this.resetInterval();

      this.setState(
        {
          currentIndex: this.state.currentIndex + 1,
          onScrollDisabled: true,
        },
        () => {
          this.slider.scrollToIndex({
            animated: true,
            index: this.state.currentIndex,
          });
          setTimeout(() => {
            this.setState({ onScrollDisabled: false });
          }, 500);
        }
      );
    }
  }

  onPressLeft() {
    if (this.state.currentIndex > 0 && this.slider) {
      this.resetInterval();
      this.setState(
        {
          currentIndex: this.state.currentIndex - 1,
          onScrollDisabled: true,
        },
        () => {
          this.slider.scrollToIndex({
            animated: true,
            index: this.state.currentIndex,
          });
          setTimeout(() => {
            this.setState({ onScrollDisabled: false });
          }, 500);
        }
      );
    }
  }

  render() {
    return (
      <View style={{}}>
        {this.props.showButtons && (
          <TouchableOpacity
            style={{
              position: "absolute",
              top: "40%",
              left: 40,
              zIndex: 15,
              justifyContent: "center",
            }}
            onPress={() => {
              this.onPressLeft();
            }}
          >
            {this.state.currentIndex > 0 && (
              <View
                style={{
                  backgroundColor: "rgba(0,0,0,0.3)",
                  borderRadius: 15,
                  width: 30,
                  height: 30,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Entypo
                  name={
                    I18nManager.isRTL
                      ? "chevron-thin-right"
                      : "chevron-thin-left"
                  }
                  color={"#fff"}
                  size={20}
                />
              </View>
            )}
          </TouchableOpacity>
        )}
        {this.props.showButtons && (
          <TouchableOpacity
            style={{
              position: "absolute",
              top: "40%",
              right: 40,
              zIndex: 15,
              justifyContent: "center",
              alignSelf: "center",
            }}
            onPress={() => {
              this.onPressRight();
            }}
          >
            {this.state.currentIndex < this.props.data.length - 1 && (
              <View
                style={{
                  backgroundColor: "rgba(0,0,0,0.3)",
                  borderRadius: 15,
                  width: 30,
                  height: 30,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Entypo
                  name={
                    I18nManager.isRTL
                      ? "chevron-thin-left"
                      : "chevron-thin-right"
                  }
                  color={"#fff"}
                  size={20}
                />
              </View>
            )}
          </TouchableOpacity>
        )}
        <FlatList
          ref={(ref) => (this.slider = ref)}
          horizontal
          keyExtractor={(item, index) => index.toString()}
          data={this.props.data}
          style={{
            flexGrow: 0,
            paddingBottom: 10,
            ...this.props.style,
          }}
          contentContainerStyle={{
            flexGrow: 0,
          }}
          // onScroll={(e) => {
          //   this.resetInterval();
          //   if (!this.state.onScrollDisabled) {
          //     this.setState({
          //       currentIndex:
          //         e.nativeEvent.contentOffset.x /
          //           Dimensions.get("screen").width <
          //           0.3
          //           ? 0
          //           : Math.round(
          //             e.nativeEvent.contentOffset.x /
          //             Dimensions.get("screen").width
          //           ),
          //     });
          //   }
          // }}
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          renderItem={this.props.renderItem}
        />
      </View>
    );
  }
}

export default HorizontalSwiper;
