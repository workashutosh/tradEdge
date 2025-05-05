import {Text, View} from 'react-native';
import React from 'react';
import {LinearGradient} from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

interface GradientTextProps {
    text: string;
    style?: object;
    colors: [string, string, ...string[]];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
}

export function GradientText(props: GradientTextProps) {
    return (
        <MaskedView
        maskElement={
            <Text style={[props.style, {backgroundColor: 'transparent'}]}>{props.text}</Text>
        }>
        <LinearGradient
            colors={props.colors}
            start={props.start}
            end={props.end}>
            <Text style={[props.style, {opacity: 0}]}>{props.text}</Text>
        </LinearGradient>
        </MaskedView>
    )
}