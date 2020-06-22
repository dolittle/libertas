// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyAccessor, PropertyDescriptor, PropertyPathResolverProxyHandler } from '@dolittle/rudiments';
import { PropertyMap } from './PropertyMap';
import { EntityType, Property } from '../entities';

export type PropertyMapBuilderCallback<TEvent extends object> = (builder: PropertyMapBuilder<TEvent>) => void;

export class PropertyMapForBuilding {
    propertyDescriptor!: PropertyDescriptor;
    targetName!: string;
}

export interface IPropertyMapBuilder {
    build(entityType: EntityType): PropertyMap[];
}

export class PropertyMapBuilder<TEvent extends object = any> implements IPropertyMapBuilder {
    private _fieldMaps: PropertyMapForBuilding[] = [];

    property(accessor: PropertyAccessor<TEvent>, targetName: string): PropertyMapBuilder<TEvent> {
        const handler = new PropertyPathResolverProxyHandler();
        const proxy = new Proxy<TEvent>({} as TEvent, handler);
        accessor(proxy);
        const map = {
            propertyDescriptor: new PropertyDescriptor(accessor, handler.segments.filter(_ => true)),
            targetName: targetName
        } as PropertyMapForBuilding;
        this._fieldMaps.push(map);
        return this;
    }

    build(entityType: EntityType): PropertyMap[] {
        const maps = this._fieldMaps.map(map => {
            const property = entityType.properties.find(_ => _.targetName === map.targetName);
            if (property) {
                return new PropertyMap(property, map.propertyDescriptor);
            }
            return new PropertyMap(Property.unknown, map.propertyDescriptor);
        });
        return maps;
    }
}
