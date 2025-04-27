import React from 'react';
import htmlToElement from './htmlToElement';
import {Linking, StyleSheet, Text} from  'react-native';
import PropTypes from 'prop-types'

class HTMLView extends React.Component{
    propTypes= {
        value: PropTypes.string,
        stylesheet: PropTypes.object,
        onLinkPress: PropTypes.func,
        onError: PropTypes.func,
        renderNode: PropTypes.func,
    };

    getDefaultProps() {
        return {
            onLinkPress: Linking.openURL,
            onError: console.error.bind(console),
        };
    };

    getInitialState() {
        return {
            element: null,
        };
    };

    componentWillReceiveProps(nextProps) {
        if (this.props.value !== nextProps.value) {
            this.startHtmlRender(nextProps.value);
        }
    };

    componentDidMount() {
        this.mounted = true;
        this.startHtmlRender(this.props.value);
    };

    componentWillUnmount() {
        this.mounted = false;
    };

    startHtmlRender(value) {
        if (!value) return this.setState({element: null});

        const opts = {
            linkHandler: this.props.onLinkPress,
            styles: Object.assign({}, baseStyles, this.props.stylesheet),
            customRenderer: this.props.renderNode,
        };

        htmlToElement(value, opts, (err, element) => {
            if (err) return this.props.onError(err);

            if (this.mounted) this.setState({element});
        });
    };

    render() {
        if (this.state && this.state.element) {
            return <Text style={this.props.stylesheet} children={this.state.element}/>;
        }
        return <Text />;
    };
};

const boldStyle = {fontWeight: 'bold'};
const italicStyle = {fontStyle: 'italic'};
const codeStyle = {};

//noinspection Eslint
const baseStyles = StyleSheet.create({
    b: boldStyle,
    strong: boldStyle,
    i: italicStyle,
    em: italicStyle,
    pre: codeStyle,
    code: codeStyle,
    a: {
        fontWeight: '500',
        color: '#007AFF',
    },
});

module.exports = HTMLView;
/**
 * Created by InspireUI on 11/01/2017.
 */
