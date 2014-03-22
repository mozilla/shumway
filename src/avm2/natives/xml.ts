/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
///<reference path='../references.ts' />

module Shumway.AVM2.AS {
  import assertNotImplemented = Shumway.Debug.assertNotImplemented;
  import notImplemented = Shumway.Debug.notImplemented;

  export class ASQName extends ASObject {
    public static instanceConstructor: any = ASQName;

    get localName(): string {
      notImplemented("public.QName::get localName"); return;
    }

    get uri(): any {
      notImplemented("public.QName::get uri"); return;
    }
  }

  export class ASXML extends ASNative {
    public static instanceConstructor: any = ASXML;

    constructor (value: any = undefined) {

      super();
    }
    get ignoreComments(): boolean {
      notImplemented("public.XML::get ignoreComments"); return;
    }
    set ignoreComments(newIgnore: boolean) {
      newIgnore = !!newIgnore;
      notImplemented("public.XML::set ignoreComments"); return;
    }
    get ignoreProcessingInstructions(): boolean {
      notImplemented("public.XML::get ignoreProcessingInstructions"); return;
    }
    set ignoreProcessingInstructions(newIgnore: boolean) {
      newIgnore = !!newIgnore;
      notImplemented("public.XML::set ignoreProcessingInstructions"); return;
    }
    get ignoreWhitespace(): boolean {
      notImplemented("public.XML::get ignoreWhitespace"); return;
    }
    set ignoreWhitespace(newIgnore: boolean) {
      newIgnore = !!newIgnore;
      notImplemented("public.XML::set ignoreWhitespace"); return;
    }
    get prettyPrinting(): boolean {
      notImplemented("public.XML::get prettyPrinting"); return;
    }
    set prettyPrinting(newPretty: boolean) {
      newPretty = !!newPretty;
      notImplemented("public.XML::set prettyPrinting"); return;
    }
    get prettyIndent(): number /*int*/ {
      notImplemented("public.XML::get prettyIndent"); return;
    }
    set prettyIndent(newIndent: number /*int*/) {
      newIndent = newIndent | 0;
      notImplemented("public.XML::set prettyIndent"); return;
    }
    toString(): string {
      notImplemented("public.XML::toString"); return;
    }
    hasOwnProperty(P: any = undefined): boolean {

      notImplemented("public.XML::hasOwnProperty"); return;
    }
    propertyIsEnumerable(P: any = undefined): boolean {

      notImplemented("public.XML::propertyIsEnumerable"); return;
    }
    addNamespace(ns: any): ASXML {

      notImplemented("public.XML::addNamespace"); return;
    }
    appendChild(child: any): ASXML {

      notImplemented("public.XML::appendChild"); return;
    }
    attribute(arg: any): ASXMLList {

      notImplemented("public.XML::attribute"); return;
    }
    attributes(): ASXMLList {
      notImplemented("public.XML::attributes"); return;
    }
    child(propertyName: any): ASXMLList {

      notImplemented("public.XML::child"); return;
    }
    childIndex(): number /*int*/ {
      notImplemented("public.XML::childIndex"); return;
    }
    children(): ASXMLList {
      notImplemented("public.XML::children"); return;
    }
    comments(): ASXMLList {
      notImplemented("public.XML::comments"); return;
    }
    contains(value: any): boolean {

      notImplemented("public.XML::contains"); return;
    }
    copy(): ASXML {
      notImplemented("public.XML::copy"); return;
    }
    descendants(name: any = "*"): ASXMLList {

      notImplemented("public.XML::descendants"); return;
    }
    elements(name: any = "*"): ASXMLList {

      notImplemented("public.XML::elements"); return;
    }
    hasComplexContent(): boolean {
      notImplemented("public.XML::hasComplexContent"); return;
    }
    hasSimpleContent(): boolean {
      notImplemented("public.XML::hasSimpleContent"); return;
    }
    inScopeNamespaces(): any [] {
      notImplemented("public.XML::inScopeNamespaces"); return;
    }
    insertChildAfter(child1: any, child2: any): any {

      notImplemented("public.XML::insertChildAfter"); return;
    }
    insertChildBefore(child1: any, child2: any): any {

      notImplemented("public.XML::insertChildBefore"); return;
    }
    localName(): Object {
      notImplemented("public.XML::localName"); return;
    }
    name(): Object {
      notImplemented("public.XML::name"); return;
    }
    private _namespace(prefix: any, argc: number /*int*/): any {
      argc = argc | 0;
      notImplemented("public.XML::private _namespace"); return;
    }
    namespaceDeclarations(): any [] {
      notImplemented("public.XML::namespaceDeclarations"); return;
    }
    nodeKind(): string {
      notImplemented("public.XML::nodeKind"); return;
    }
    normalize(): ASXML {
      notImplemented("public.XML::normalize"); return;
    }
    parent(): any {
      notImplemented("public.XML::parent"); return;
    }
    processingInstructions(name: any = "*"): ASXMLList {

      notImplemented("public.XML::processingInstructions"); return;
    }
    prependChild(value: any): ASXML {

      notImplemented("public.XML::prependChild"); return;
    }
    removeNamespace(ns: any): ASXML {

      notImplemented("public.XML::removeNamespace"); return;
    }
    replace(propertyName: any, value: any): ASXML {

      notImplemented("public.XML::replace"); return;
    }
    setChildren(value: any): ASXML {

      notImplemented("public.XML::setChildren"); return;
    }
    setLocalName(name: any): void {

      notImplemented("public.XML::setLocalName"); return;
    }
    setName(name: any): void {

      notImplemented("public.XML::setName"); return;
    }
    setNamespace(ns: any): void {

      notImplemented("public.XML::setNamespace"); return;
    }
    text(): ASXMLList {
      notImplemented("public.XML::text"); return;
    }
    toXMLString(): string {
      notImplemented("public.XML::toXMLString"); return;
    }
    notification(): Function {
      notImplemented("public.XML::notification"); return;
    }
    setNotification(f: Function): any {
      f = f;
      notImplemented("public.XML::setNotification"); return;
    }
  }

  export class ASXMLList extends ASNative {
    public static instanceConstructor: any = ASXMLList;

    constructor (value: any = undefined) {

      super();
    }
    toString(): string {
      notImplemented("public.XMLList::toString"); return;
    }
    hasOwnProperty(P: any = undefined): boolean {

      notImplemented("public.XMLList::hasOwnProperty"); return;
    }
    propertyIsEnumerable(P: any = undefined): boolean {

      notImplemented("public.XMLList::propertyIsEnumerable"); return;
    }
    attribute(arg: any): ASXMLList {

      notImplemented("public.XMLList::attribute"); return;
    }
    attributes(): ASXMLList {
      notImplemented("public.XMLList::attributes"); return;
    }
    child(propertyName: any): ASXMLList {

      notImplemented("public.XMLList::child"); return;
    }
    children(): ASXMLList {
      notImplemented("public.XMLList::children"); return;
    }
    comments(): ASXMLList {
      notImplemented("public.XMLList::comments"); return;
    }
    contains(value: any): boolean {

      notImplemented("public.XMLList::contains"); return;
    }
    copy(): ASXMLList {
      notImplemented("public.XMLList::copy"); return;
    }
    descendants(name: any = "*"): ASXMLList {

      notImplemented("public.XMLList::descendants"); return;
    }
    elements(name: any = "*"): ASXMLList {

      notImplemented("public.XMLList::elements"); return;
    }
    hasComplexContent(): boolean {
      notImplemented("public.XMLList::hasComplexContent"); return;
    }
    hasSimpleContent(): boolean {
      notImplemented("public.XMLList::hasSimpleContent"); return;
    }
    length(): number /*int*/ {
      notImplemented("public.XMLList::length"); return;
    }
    name(): Object {
      notImplemented("public.XMLList::name"); return;
    }
    normalize(): ASXMLList {
      notImplemented("public.XMLList::normalize"); return;
    }
    parent(): any {
      notImplemented("public.XMLList::parent"); return;
    }
    processingInstructions(name: any = "*"): ASXMLList {

      notImplemented("public.XMLList::processingInstructions"); return;
    }
    text(): ASXMLList {
      notImplemented("public.XMLList::text"); return;
    }
    toXMLString(): string {
      notImplemented("public.XMLList::toXMLString"); return;
    }
    addNamespace(ns: any): ASXML {

      notImplemented("public.XMLList::addNamespace"); return;
    }
    appendChild(child: any): ASXML {

      notImplemented("public.XMLList::appendChild"); return;
    }
    childIndex(): number /*int*/ {
      notImplemented("public.XMLList::childIndex"); return;
    }
    inScopeNamespaces(): any [] {
      notImplemented("public.XMLList::inScopeNamespaces"); return;
    }
    insertChildAfter(child1: any, child2: any): any {

      notImplemented("public.XMLList::insertChildAfter"); return;
    }
    insertChildBefore(child1: any, child2: any): any {

      notImplemented("public.XMLList::insertChildBefore"); return;
    }
    nodeKind(): string {
      notImplemented("public.XMLList::nodeKind"); return;
    }
    private _namespace(prefix: any, argc: number /*int*/): any {
      argc = argc | 0;
      notImplemented("public.XMLList::private _namespace"); return;
    }
    localName(): Object {
      notImplemented("public.XMLList::localName"); return;
    }
    namespaceDeclarations(): any [] {
      notImplemented("public.XMLList::namespaceDeclarations"); return;
    }
    prependChild(value: any): ASXML {

      notImplemented("public.XMLList::prependChild"); return;
    }
    removeNamespace(ns: any): ASXML {

      notImplemented("public.XMLList::removeNamespace"); return;
    }
    replace(propertyName: any, value: any): ASXML {

      notImplemented("public.XMLList::replace"); return;
    }
    setChildren(value: any): ASXML {

      notImplemented("public.XMLList::setChildren"); return;
    }
    setLocalName(name: any): void {

      notImplemented("public.XMLList::setLocalName"); return;
    }
    setName(name: any): void {

      notImplemented("public.XMLList::setName"); return;
    }
    setNamespace(ns: any): void {

      notImplemented("public.XMLList::setNamespace"); return;
    }
  }

}