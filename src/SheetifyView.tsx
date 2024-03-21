import React, { PureComponent, Component, type RefObject, createRef, type ReactNode } from 'react'
import {
  StyleSheet,
  requireNativeComponent,
  Platform,
  findNodeHandle,
  type NativeMethods,
  type ViewStyle,
  type StyleProp,
  View,
} from 'react-native'

import type { SheetifyViewProps } from './types'
import { SheetifyModule } from './SheetifyModule'

const LINKING_ERROR =
  `The package 'react-native-sheetify' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n'

interface NativeSheetifyViewProps {
  style: StyleProp<ViewStyle>
  children?: ReactNode
}

type ContentRef = Component<NativeSheetifyViewProps> & Readonly<NativeMethods>

const ComponentName = 'SheetifyView'

const NativeSheetifyView = requireNativeComponent<NativeSheetifyViewProps>(ComponentName)
if (!NativeSheetifyView) {
  throw new Error(LINKING_ERROR)
}

export class SheetifyView extends PureComponent<SheetifyViewProps> {
  displayName = 'Sheetify'
  private readonly ref: RefObject<ContentRef>

  constructor(props: SheetifyViewProps) {
    super(props)
    this.ref = createRef<ContentRef>()
  }

  private get handle(): number {
    const nodeHandle = findNodeHandle(this.ref.current)
    if (nodeHandle == null || nodeHandle === -1) {
      throw new Error(`Could not get native view tag`)
    }

    return nodeHandle
  }

  componentDidMount(): void {
    if (!this.props.scrollRef?.current) return

    const scrollableHandle = findNodeHandle(this.props.scrollRef.current)
    SheetifyModule.handleScrollable(this.handle, scrollableHandle)
  }

  /**
   * Present the modal sheet
   */
  public async present() {
    await SheetifyModule.present(this.handle)
  }

  render(): ReactNode {
    return (
      <NativeSheetifyView style={$sheetify} ref={this.ref}>
        <View style={this.props.style}>{this.props.children}</View>
      </NativeSheetifyView>
    )
  }
}

const $sheetify: ViewStyle = {
  ...StyleSheet.absoluteFillObject,
  zIndex: -10000,
}
