/// <reference path="./tables.modules.d.ts" />

type ArrayList<T extends unknown = unknown> = T[];
type StringList = string[];
type List<T extends unknown = unknown> = T[];
type TimeZone = string;
/**
 * The API allows you to evaluate scripts from a GlideRecord field
 */
declare class GlideScopedEvaluator {
    /**
     * Puts a variable into the GlideScopedEvaluator object
     */
    putVariable(name?: string, value?: any): void;
    /**
     * Gets a variable from a GlideScopedEvaluator object
     */
    getVariable(name?: string): any;
    reset(): void;
    withQuickEvalSupported(supportQuickEval?: boolean): any;
    withEnforcedSecurity(enforceSecurity?: boolean): any;
    withSandboxVariables(isSandboxVariables?: boolean): any;
    withInterpretedMode(interpreted?: boolean): any;
    withReturnError(returnError?: boolean): any;
    /**
     * Evaluates a script from a GlideRecord field. variables parameter is optional
     */
    evaluateScript(grObj?: any, scriptField?: string, variables?: any): any;
    constructor();
}
/**
 * Scoped API for PluginManager
 */
declare class GlidePluginManager {
    init(haveDB?: boolean): void;
    static getActivePlugins(): Map<string, Plugin>;
    static startPluginFromCluster(pluginName?: string): void;
    static getInstalledPlugins(): Map<string, Plugin>;
    static getInstalledCorePlugins(): Map<string, Plugin>;
    static getInstalledPlugin(pluginName?: string): Plugin;
    static getActivePlugin(pluginName?: string): Plugin;
    static getPluginDependencies(pluginName?: string): string;
    static getExtensionMap(): Map<string, Map<string, ExtensionPoint>>;
    static getPluginPath(pluginName?: string): string;
    static getUninstalledConditionalPlugins(pluginName?: string): ㅤGlideRecord;
    static loadAllDemo(): void;
    static loadPluginData(pluginName?: string): void;
    static loadDemoData(pluginName?: string): void;
    static loadPluginData(pluginName?: string, dir?: string): void;
    static isRegistered(pluginId?: string): boolean;
    /**
     * Determine if a plugin is activated
     */
    static isActive(plugin_id?: string): boolean;
    static isPublished(plugin_id?: string): boolean;
    registerPlugin(pluginName?: string): void;
    registerOOBContent(): void;
    registerAndActivateCoreJumboApps(): void;
    repairPlugin(pluginName?: string): void;
    upgradeCount(): number;
    upgrade(): void;
    setSkipDependentUpdate(b?: boolean): void;
    isSkipDependentUpdate(): boolean;
    setSource(source?: string): void;
    static setZboot(b?: boolean): void;
    static isZboot(): boolean;
    static isUpgradeSystemBusy(): boolean;
    static verifyFilenames(): void;
    static getRollbackContextId(pluginName?: string): string;
    static getRollbackRunId(rollbackContextId?: string): string;
    static canRollback(pluginName?: string): boolean;
    static getRollbackDenialReason(pluginName?: string): string;
    constructor();
}
/**
 * The Scoped GlideTableHierarchy API provides methods for handling information about table relationships
 */
declare class GlideTableHierarchy {
    constructor(tableName?: string);
    /**
     * Returns the table's name
     */
    getName(): string;
    /**
     * Returns a list of the table names in the hierarchy
     */
    getTables(): ArrayList<string>;
    /**
     * Returns a list of all tables that extend the current table
     */
    getTableExtensions(): ArrayList<string>;
    /**
     * Returns a list of all tables that extend the current table and includes the current table
     */
    getAllExtensions(): ArrayList<string>;
    /**
     * Returns a list of all classes in the hierarchy of the given table
     */
    getHierarchy(): ArrayList<string>;
    /**
     * Returns the top level class in the hierarchy
     */
    getRoot(): string;
    /**
     * Returns the parent class
     */
    getBase(): string;
    /**
     * Returns true if this is a base class
     */
    isBaseClass(): boolean;
    /**
     * Returns true if this table is not in a hierarchy
     */
    isSoloClass(): boolean;
    /**
     * Returns true of this class has been extended
     */
    hasExtensions(): boolean;
}
/** Authentication API */
declare namespace sn_auth { /** The OAuth client API provides methods to request and revoke OAuth tokens */
    class GlideOAuthClient {
        /** Retrieves the token for the client, with the request parameters encoded in JSON format */
        requestToken(clientName?: string, jsonString?: string): sn_auth.GlideOAuthClientResponse;
        /** Retrieves the token for the client, with the request and optional header parameters set into a GlideOAuthClientRequest object */
        requestTokenByRequest(clientName?: string, request?: GlideOAuthClientRequest): sn_auth.GlideOAuthClientResponse;
        /** Revokes the access or refresh token for the client, with the request and optional header parameters set into a GlideOAuthClientRequest object */
        revokeToken(clientName?: string, accessToken?: string, refreshToken?: string, request?: GlideOAuthClientRequest): sn_auth.GlideOAuthClientResponse;
        constructor();
    }
    /** Use these methods for handling client requests */
    class GlideOAuthClientRequest {
        /** Retrieves the parameter for the parameter name you provide */
        getParameter(name?: string): void;
        /** Sets the parameters for the name:value pair of strings you provide */
        setParameter(name?: string, value?: string): void;
        /** Retrieves the HTTP headers */
        getHeaders(): any;
        /** Retrieves the HTTP headers for the string you provide */
        getHeader(name?: string): void;
        /** Sets the HTTP headers for the nave:value pair that you provide */
        setHeader(name?: string, value?: string): void;
        /** Retrieves the grant type */
        getGrantType(): void;
        /** Sets the grant type with the string you provide */
        setGrantType(): void;
        /** Retrieves the scope */
        getScope(): string;
        /** Sets the scope with the string you provide */
        setScope(scope?: string): void;
        /** Retrieves the user name */
        getUserName(): string;
        /** Sets the user name with the string you provide */
        setUserName(userName?: string): void;
        /** Retrieves the password */
        getPassword(): string;
        /** Sets the password with the string you provide */
        setPassword(password?: string): void;
        /** Retrieves the refresh token */
        getRefreshToken(): string;
        /** Sets the refresh token with the string you provide */
        setRefreshToken(refreshToken?: string): void;
        constructor();
    }
    /** Use these methods for retrieving the access token and information about the access token */
    class GlideOAuthToken {
        /** Retrieves the access token */
        getAccessToken(): string;
        /** Retrieves the sys_id of the token ID */
        getAccessTokenSysID(): string;
        /** Retrieves the lifespan of the access token in seconds */
        getExpiresIn(): number;
        /** Retrieves the refresh token */
        getRefreshToken(): number;
        /** Retrieves the sys_id of the refresh token */
        getRefreshTokenSysID(): string;
        /** Retrieves the scope, which is the amount of access granted by the access token */
        getScope(): string;
        constructor();
    }
    class GlideOAuthClientResponse {
        /** Retrieves the refresh token */
        getToken(): sn_auth.GlideOAuthToken;
        /** Retrieves the error message if authentication is not successful */
        getErrorMessage(): string;
        /** Retrieves the response content from an external OAuth provider. The response is in a name:value pair */
        getResponseParameters(): any;
        /** Retrieves the HTTP response content header from an external OAuth provider */
        getContentType(): string;
        /** Retrieves all of the response information, including instance information */
        getBody(): string;
        /** Retrieves the HTTP response code from the external OAuth provider */
        getResponseCode(): string;
        constructor();
    }
}
/** ServiceNow processors are equivalent to Java servlets. Processors provide a customizable URL endpoint that can execute arbitrary server-side Javascript code and produce output such as TEXT, JSON, or HTML. The GlideServletResponse API is used in processor scripts to access the HttpServletResponse object. The GlideServletResponse object provides a subset of the HttpServletResponse APIs. The methods are called using the global variable g_response. A useful global variable, g_target, is available in processor scripts. It contains the table name extracted from the URL. The URL to a processor has the format: https://<instance name.servicenow.com>/<path endpoint>.do?<parameter endpoint>=<value> where the path endpoint and parameter endpoint are defined on the processor form */
declare class GlideServletResponse {
    /** Sends a temporary redirect to the client */
    sendRedirect(location?: string): void;
    /** Sets the MIME type of the response */
    setContentType(type?: string): void;
    /** Sets the status code for the response */
    setStatus(status?: number): void;
    /** Sets a response header to the specified value */
    setHeader(key?: string, value?: string): void;
    constructor();
}
/**
 * GlideRecordSecure is a class inherited from GlideRecord that performs the same functions as GlideRecord, and also
 * enforces ACLs
 */
declare class GlideRecordSecure extends GlideRecord {
    getElements(): ArrayList;
    query(field?: any, value?: any): void;
    insertWithReferences(): string;
    updateWithReferences(reason?: any): string;
    insertOrUpdate(keyField?: string): string;
    deleteMultiple(): void;
    getValue(name?: string): string;
    enableSecurityFeature(feature?: string): void;
    disableSecurityFeature(feature?: string): void;
}
/**
 * XMLDocument2 is a JavaScript Object wrapper for parsing and extracting XML
 * data from an XML string. Use this JavaScript class to instantiate an object
 * from an XML string, usually a return value fro...
 */
declare class XMLDocument2 {
    constructor(cx?: Context, args?: any[], ctorObj?: Function, inNewExpr?: boolean);
    /**
     * Parses the XML string and loads it into the XMLDocument2 object
     */
    parseXML(xmlDoc?: string): boolean;
    /**
     * Checks if the XMLDocument is valid
     */
    isValid(): boolean;
    /**
     * Gets all the text child nodes from the node referenced in the xpath
     */
    getNodeText(xpath?: string): string;
    setNamespaceAware(nsAware?: boolean): void;
    setEnableCDATAReporting(enableCDATAReporting?: boolean): void;
    /**
     * Gets the node specified in the xpath
     */
    getNode(xpath?: string): XMLNode;
    /**
     * Gets the first node in the specified xpath
     */
    getFirstNode(xpath?: string): XMLNode;
    /**
     * Gets the node after the specified node
     */
    getNextNode(prev?: any): XMLNode;
    /**
     * Creates and adds an element node to the current node.
     * The element name is the string passed in as a parameter.
     * The new element node has no text child nodes
     */
    createElement(name?: string): XMLNode;
    /**
     * Creates an element node with a text child node and adds it to the current node
     */
    createElementWithTextValue(name?: string, value?: string): XMLNode;
    /**
     * Makes the node passed in as a parameter the current node
     */
    setCurrentElement(element?: any): void;
    /**
     * Gets the document element node of the XMLDocument2. The document element node is the root node
     */
    getDocumentElement(): XMLNode;
    /**
     * Returns a string containing the XML
     */
    toString(): string;
}
declare class GlideSystemUtilScript {
    isValidScript(script?: string): boolean;
    isValidScriptFromScope(script?: string, scopeId?: string): boolean;
    loadBatchScript(fileName?: string): void;
    getScriptError(script?: string): string;
    getScriptErrorFromScope(script?: string, scopeId?: string): string;
    isESLatest(): boolean;
    _getScriptError(script?: string, scopeId?: string): string;
    _getScriptErrorForTable(script?: string, scopeId?: string, table?: string): string;
    _getScriptErrorWithToggle(script?: string, scopeId?: string, table?: string, sysId?: string, useESLatest?: boolean): string;
    scheduleScript(scriptName?: string, currentObj?: any, parmString?: any): void;
    constructor();
}
declare class GlideSystemUtilDB {
    rebuildAllIndexes(): void;
    rebuildIndexes(tableName?: string): void;
    ensureCompositeIndex(tableName?: string, sfields?: string, indexName?: string): void;
    ensureIndex(tableName?: string, elementName?: string): boolean;
    trace(onOff?: boolean): void;
    getDisplayValueFor(table?: string, key?: string, field?: string): string;
    truncateTable(name?: string): void;
    sqlItemsByID(table?: string, sfields?: any, sys_id?: string, limit?: number): ArrayList;
    sqlItemsByField(table?: string, sfields?: any, fwfield?: string, value?: string, limit?: number): ArrayList;
    fieldExists(tableName?: string, fieldName?: string): boolean;
    tableCreate(name?: string, label?: any): string;
    healthCheck(filePattern?: string, reportonly?: boolean): boolean;
    sql(statement?: string): void;
    alterSqlFieldDefintion(table?: string, element?: string, oldLength?: any): void;
    reset(): boolean;
    dropColumnQuick(tableName?: string, fieldName?: string): void;
    dropColumn(tableName?: string, fieldName?: string): void;
    dropTable(tableName?: string): void;
    dropTableRecord(dbObject?: ㅤGlideRecord): void;
    resetDB(dbName?: string): void;
    flushStatus(): void;
    _dropTable(tableName?: string): void;
    renameTable(tableName?: string, newTableName?: string, cacheFlush?: boolean): void;
    tableDrop(name?: string): void;
    isTableInScope(tableName?: string): boolean;
    isScopedApp(): boolean;
    isScopedAdminApp(): boolean;
    getInScopeTables(): StringList;
    getInScopeDBViews(): StringList;
    getDictionaryEntryScope(tableName?: string, fieldName?: string): string;
    getDictionaryEntryPackage(tableName?: string, fieldName?: string): string;
    constructor();
}
/**
 * The Scoped ImportLog API provides access to import log.
 */
declare class GlideImportLog extends GlideTransformLog {
    constructor(arg1?: any, arg2?: any);
    /**
     * Log record at info level
     */
    info(message?: string): void;
    /**
     * Log record at warn level
     */
    warn(message?: string): void;
    /**
     * Log record at error level
     */
    error(message?: string): void;
    /**
     * Log record at info level
     */
    info(message?: string, source?: string): void;
    /**
     * Log record at warn level
     */
    warn(message?: string, source?: string): void;
    /**
     * Log record at error level
     */
    error(message?: string, source?: string): void;
    getImportRunHistory(): string;
    setImportRunHistory(importRunHistory?: string): void;
}
/** The Scoped GlideDBFunctionCaseBuilder provides a builder API for creating platform case statements */
declare class GlideDBFunctionCaseBuilder {
    /** Add a condition parameter to the case statement */
    when(glidefunction?: string): GlideDBFunctionCaseBuilderThen;
    /** Add a condition parameter to the case statement */
    whenEqual(left?: string, right?: string): GlideDBFunctionCaseBuilderThen;
    /** Add a condition parameter to the case statement */
    whenCompare(left?: string, operation?: string, right?: string): GlideDBFunctionCaseBuilderThen;
}
/**
 * GlideSession manages all of the information for a user session. You can retrieve this from gs.getSession()
 */
declare class GlideSession {
    constructor();
    static get(): GlideSession;
    putProperty(key?: string, value?: any): void;
    clearProperty(key?: string): void;
    getProperty(key?: string): any;
    getBooleanProperty(key?: string, bDefault?: boolean): boolean;
    getIntProperty(key?: string, iDefault?: number): number;
    getIntProperty(key?: string): number;
    /**
     * Store a value in an active session
     */
    putClientData(name?: string, value?: string): void;
    clearClientData(name?: string): void;
    /**
     * Fetch the value in active session based on the name
     */
    getClientData(name?: string): string;
    getClientDataMap(): ChoiceList;
    static disconnect(): void;
    static disconnect(releaseMutexes?: boolean): void;
    checkActiveDBs(): void;
    getSessionKey(): string;
    /**
     * Language used by the user
     */
    getLanguage(): string;
    setLanguage(language?: string): void;
    /**
     * Get the Time Zone name associated with the user
     */
    getTimeZoneName(): string;
    getTimeZoneShortName(): string;
    setTimeZoneName(timezoneName?: string): void;
    getTimeZone(): TimeZone;
    getDateTimeFormat(): string;
    getDateTimeFormat(dateStyle?: string): string;
    getDateFormat(): string;
    getDateFormat(style?: string): string;
    setDateFormat(dateFormat?: string): void;
    getTimeFormat(): string;
    setTimeFormat(timeFormat?: string): void;
    getSessionID(): string;
    impersonate(userSysId?: string): string;
    onlineImpersonate(userSysId?: string): string;
    onlineUnimpersonate(): string;
    loadUserByID(userSysId?: string): User;
    getUserName(): string;
    getUID(): string;
    /**
     * Checks if the current session is interactive
     */
    isInteractive(): boolean;
    setInteractive(b?: boolean): void;
    addInfoMessage(message?: string): void;
    addTrivialMessage(message?: string): void;
    addErrorMessage(message?: string): void;
    hasRole(appRoles?: string): boolean;
    setWatchField(id?: string): void;
    getWatchField(): string;
    clearWatchField(): void;
    getFullName(): string;
    setDomainID(domainID?: string): void;
    getCurrentDomainID(): string;
    getLoginHome(direct?: boolean): string;
    getUser(): User;
    getHttpSession(): HttpSession;
    /**
     * Determines if the current user is currently logged in
     */
    isLoggedIn(): boolean;
    getStack(): GlideStack;
    getStackName(): string;
    getStack(stackName?: string): GlideStack;
    getURI(): string;
    setURI(uri?: string): void;
    resetURI(): string;
    static getSeparationValue(): string;
    static disableSeparation(): void;
    static enableSeparation(): void;
    getBusinessRuleStack(): Stack;
    setContextualMode(mode?: string): void;
    getContextualMode(): string;
    getRoles(): string;
    getRoles(includeDefaultRoles?: boolean): string;
    getAvailableElevatedRoles(): string;
    getActivatedElevatedRoles(): string;
    setCacheFlush(onOrOff?: boolean): boolean;
    setCacheIgnoreFlushTable(table?: string): string;
    getWorkflow(): boolean;
    getRunEngines(): boolean;
    setWorkflow(onOrOff?: boolean): boolean;
    setRunEngines(onOrOff?: boolean): boolean;
    isLockedOut(): boolean;
    getBooleanProperty(name?: string): boolean;
    /**
     * Gets the client IP address
     */
    getClientIP(): IPAddress;
    getEncryptionContext(): EncryptionContext;
    getCryptoModulePickerForTableWithSingleModule(tableName?: string): CryptoModulePicker;
    getCryptoModulePicker(): CryptoModulePicker;
    setStrictQuery(b?: boolean): boolean;
    isQueryCategoryPoolDisabled(poolName?: string): boolean;
    setOverrideQueryCategoryPool(poolGR?: ㅤGlideRecord): void;
    resetOverrideQueryCategoryPool(): void;
    isOverridingQueryRoute(poolGR?: ㅤGlideRecord): boolean;
    disableQueryCategoryPool(poolName?: string): void;
    resetDisabledQueryCategoryPool(poolName?: string): void;
    getKaaProfile(): ScopedKMFKaaProfile;
}
declare namespace sn_impex {
    /**
     * The Scoped GlideExcelParser API provides access to information about the excel document.
     */
    class ScopedGlideExcelParser {
        /**
         * Parse the document uploaded
         */
        parse(is?: InputStream): boolean;
        /**
         * Set the sheet number to be retrieved
         */
        setSheetNumber(sheetNumber?: number): void;
        /**
         * Set the header row number to be retrieved
         */
        setHeaderRowNumber(headerRowNumber?: number): void;
        /**
         * Set the sheet name to be retrieved
         */
        setSheetName(sheetName?: string): void;
        /**
         * Get the column headers
         */
        getColumnHeaders(): ArrayList<string>;
        /**
         * Moves to the next row(if there's one)
         */
        next(): boolean;
        /**
         * Get the current row
         */
        getRow(): Map;
        /**
         * Gets the error message
         */
        getErrorMessage(): string;
        /**
         * Close the connection and release the document
         */
        close(): void;
        constructor();
    }
}
declare class GlideScriptedProcessor {
    /**
     * Writes the specified string to the current URL
     */
    writeOutput(s?: string): void;
    /**
     * Writes the specified string to the current URL in the specified character-encoding
     */
    writeOutput(contentType?: string, s?: string): void;
    /**
     * Encodes an object as a JSON string and writes it to the current URL
     */
    writeJSON(jsonObject?: Map<string, any>): void;
    /**
     * Redirects to the specified URL
     */
    redirect(url?: string): void;
    constructor();
}
/**
 * The scoped GlideTime class provides methods for performing operations on GlideTime objects, such as instantiating GlideTime objects or working with GlideTime fields
 */
declare class GlideTime extends GlideDateTime {
    constructor();
    constructor(ms?: number);
    constructor(template?: GlideTime);
    /**
     * Sets the time of the GlideTime object in the internal time zone, which is UTC by default or the value of the glide.sys.internal.tz property, if set
     */
    setValue(o?: any): void;
    /**
     * Sets a time value using the current user's display format and time zone
     */
    setDisplayValue(time?: string): void;
    /**
     * Gets the time in the current user's display format and time zone
     */
    getDisplayValue(): string;
    /**
     * Gets the time in the given time format
     */
    getByFormat(format?: string): string;
    /**
     * Gets the time value stored in the database by the GlideTime object in the internal format, HH?:mm:ss, and the system time zone, UTC by default
     */
    getValue(): string;
    getXMLValue(): string;
    setXMLValue(xml?: string): void;
    getLocalTime(target?: GlideDateTime): GlideTime;
    /**
     * Returns the hour-of-the-day part of UTC time 0-23
     */
    getHourOfDayUTC(): number;
    /**
     * Returns hour part of UTC time 0-11
     */
    getHourUTC(): number;
    /**
     * Returns minutes part of UTC time
     */
    getMinutesUTC(): number;
    /**
     * Returns hour-of-the-day part of local time 0-23
     */
    getHourOfDayLocalTime(): number;
    /**
     * Returns hour part of local time 0-11
     */
    getHourLocalTime(): number;
    /**
     * Returns minutes part of local time
     */
    getMinutesLocalTime(): number;
    /**
     * Returns seconds part of time
     */
    getSeconds(): number;
}
/**
 * The Scoped GlideUser API provides access to information about the current user and current user roles. Using the Scoped GlideUser API avoids the need to use the slower GlideRecord queries to get user...
 */
declare class GlideUser {
    isDefault(): boolean;
    static getUser(user?: string): User;
    static getUserByID(id?: string): User;
    static getUserByEmail(email?: string): User;
    static getSysIdByEmail(email?: string): string;
    getEmail(): string;
    getFullName(): string;
    getManagerID(): string;
    /**
     * Gets the display name of the current user
     */
    getDisplayName(): string;
    getDepartmentID(): string;
    getManagerName(): string;
    static authenticateMutualAuthToken(): string;
    static authenticateOAuthAccessToken(token?: string): string;
    static authenticateUser(user?: string, password?: string): string;
    static authenticate(user?: string, password?: string): boolean;
    exists(): boolean;
    getCompanyRecord(): ㅤGlideRecord;
    /**
     * Gets the Company ID of the current user
     */
    getCompanyID(): string;
    setDomainID(id?: string): void;
    getDomainID(): string;
    getDomainDisplayValue(): string;
    getTZ(): string;
    getTimeZoneLabel(): string;
    getTimeZoneLabelLang(language?: string): string;
    getDateTimeFormat(): string;
    getDateFormat(): string;
    getDateFormatEx(style?: string): string;
    setDateFormat(df?: string): void;
    getTimeFormat(): string;
    setTimeFormat(tf?: string): void;
    static resolveSysId(value?: string): string;
    static getSysId(name?: string, value?: string): string;
    /**
     * Gets the sys_id of current user
     */
    getID(): string;
    getLanguage(): string;
    /**
     * Gets the user id, or login name, of the current user
     */
    getName(): string;
    setPreference(name?: string, value?: string): void;
    savePreferences(): void;
    /**
     * * Saves a user preference value to the database
     */
    savePreference(name?: string, value?: string): void;
    static getCurrentUser(): User;
    /**
     * Gets the specified user preference value for the current user
     */
    getPreference(name?: string): string;
    static getSysTimeZone(): string;
    isLockedOut(): boolean;
    static isLockedOut(userName?: string): boolean;
    static isWebSvcAccessOnly(userName?: string): boolean;
    static resolveNameFromLoginName(name?: string): string;
    static resolveNameFromLoginName(name?: any): string;
    static resolveNameFromSysID(sysID?: string): string;
    getFirstName(): string;
    getLastName(): string;
    getMyExplicitGroups(): StringList;
    /**
     * Determines if the current user is a member of the specified group
     */
    isMemberOf(group?: any): boolean;
    isExplicitMemberOf(group?: any): boolean;
    getMyGroups(): StringList;
    getMyGroupsExcludeAdmin(): StringList;
    static getMyGroups(user?: string): StringList;
    static getMyExplicitGroups(u?: string): StringList;
    getManagedGroups(): StringList;
    static getAllGroups(): StringList;
    getLocation(): string;
    getMobileNumber(): string;
    getRoles(): GlideVector;
    getAllRoles(): List<string>;
    getUserType(): string;
    getUserRoles(): GlideVector;
    /**
     * Determines if the current user has the specified role
     */
    hasRole(o?: any): boolean;
    hasAssignedRole(roleName?: string): boolean;
    hasRoles(): boolean;
    getRecord(): GlideMemoryRecord;
    isXML(): boolean;
    isTimeLimitedCredential(): boolean;
    isACRUser(): boolean;
    isOpenIDConnect(): boolean;
    getCountry(): string;
    setPreferencesLoaded(b?: boolean): void;
    getTitle(): string;
    isReadOnlyUser(): boolean;
    getInitials(): string;
    getAvatar(): string;
    getBusinessNumber(): string;
    getIdentityType(): string;
    isIdentityTypeAIAgent(): boolean;
    constructor();
}
/**
 * The scoped GlideSchedule API provides methods for performing operations on GlideSchedule objects, such as adding new
 * schedule segments to a schedule, determining if a datetime is within the schedule...
 */
declare class GlideSchedule {
    /**
     * Loads a schedule with the schedule information. If a timezone is not specified or is nil, the current session
     * timezone is used for the schedule
     */
    load(sysID?: string): void;
    /**
     * Gets the current schedule name
     */
    getName(): string;
    /**
     * Sets the timezone for the current schedule
     */
    setTimeZone(tz?: string): void;
    /**
     * Determines if the current schedule is valid. A schedule is valid if it has at least one schedule span
     */
    isValid(): boolean;
    /**
     * Determines the elapsed time in the schedule between two date time values using the timezone of the schedule or,
     * if that is not specified, the timezone of the session
     */
    duration(startDate?: GlideDateTime, endDate?: GlideDateTime): GlideDuration;
    /**
     * Adds a new schedule segment to the current schedule
     */
    add(startDate?: GlideDateTime, offset?: GlideDuration): GlideDateTime;
    constructor();
}
/**
 * The Scoped GlideElement API provides methods for dealing with fields and their values. Scoped GlideElement methods
 * are available for the fields of the current GlideRecord
 */
declare class GlideElement {
    constructor();
    toString(): string;
    hasValue(): boolean;
    isArray(): boolean;
    isObject(): boolean;
    size(): number;
    isNil(): boolean;
    /**
     * Determines whether the field is null
     */
    nil(): boolean;
    /**
     * Gets the formatted display value of the field
     */
    getDisplayValue(maxCharacters?: number): string;
    /**
     * Gets the decrypted value
     */
    getDecryptedValue(): string;
    getTextAreaDisplayValue(): string;
    getElementValue(name?: string): string;
    getDisplayValueExt(maxCharacters?: number, nullsub?: string): string;
    getHTMLValueExt(maxCharacters?: number, nullsub?: string): string;
    getEscapedValue(): string;
    getChoiceValue(): string;
    getChoiceValueLang(language?: string): string;
    /**
     * Retrieves the choice list for a field
     */
    getChoices(dependent?: string): ArrayList;
    /**
     * Gets the field's element descriptor
     */
    getED(): ElementDescriptor;
    /**
     * Gets the value of the attribute on the field in question from the dictionary as a string. If the attribute is a
     * boolean attribute, use getBooleanAttribute(String) to get the value as a boolean rathe...
     */
    getAttribute(attribute?: string): string;
    /**
     * Gets the value of the attribute on the field in question from the dictionary as a string. To get the value as a
     * string, use getAttribute(string)
     */
    getBooleanAttribute(attribute?: string): boolean;
    /**
     * Determines whether a field has a particular attribute
     */
    hasAttribute(attribute?: string): boolean;
    getStyle(): string;
    getFullStyle(): SysStyleResult;
    getContextName(): string;
    getContextID(): string;
    getFieldStyle(): string;
    explainLock(): string;
    getDebugCount(): number;
    getError(): string;
    /**
     * Adds an error message. Can be retrieved using getError()
     */
    setError(error?: string): void;
    debug(msg?: any): void;
    /**
     * Determines if the current field has been modified
     */
    changes(): boolean;
    /**
     * Determines if the new value of a field after a change matches a certain object
     */
    changesTo(o?: any): boolean;
    changesToNotEmpty(): boolean;
    changesFromNotEmpty(): boolean;
    /**
     * Determines the previous value of the current field matched a certain object
     */
    changesFrom(o?: any): boolean;
    getDependent(): string;
    /**
     * Gets the table name
     */
    getTableName(): string;
    getBaseTableName(): string;
    /**
     * Gets the name of the field
     */
    getName(): string;
    getDependentTable(): string;
    /**
     * Determines if the GlideRecord table can be written to
     */
    canWrite(): boolean;
    /**
     * Determines if the GlideRecord table can be read from
     */
    canRead(): boolean;
    /**
     * Determines if the user's role permits creation of new records in this field
     */
    canCreate(): boolean;
    hasRightsTo(operation?: string): boolean;
    isDynamicCreate(): boolean;
    getReferenceKey(): string;
    getHTMLValue(maxChars?: number): string;
    getInitialValue(): string;
    setInitialValue(value?: string): void;
    getDisplayValueLang(language?: string): string;
    /**
     * Sets the display value of the field
     */
    setDisplayValue(value?: any): void;
    /**
     * Sets the display value of the field
     */
    setValue(value?: any): void;
    setJournalEntry(value?: any, userName?: string): void;
    getValue(): string;
    getValueMapping(): string;
    setValueMapping(mapping?: string): void;
    hasMapping(): boolean;
    elementSupportsMapping(): boolean;
    getModifiedBy(): string;
    getXMLValue(): string;
    /**
     * Gets the object's label
     */
    getLabel(): string;
    getLabelLang(language?: string): string;
    getHint(): string;
    getGlideRecord(): ㅤGlideRecord;
    getGlideObject(): AGlideObject;
    getXHTMLValue(): string;
    getMappingConfig(): MappingLookupSourceDescriptor;
}
/**
 * The scoped GlideDateTime default constructor, instantiates a new GlideDateTime object with the current date and time
 * in Greenwich Mean Time (GMT). Optional 'value' parameter with a date and time val...
 */
declare class GlideDateTime extends AGlideObject {
    constructor();
    constructor(value?: string);
    constructor(value?: string, isDisplayValue?: boolean);
    constructor(g?: GlideDateTime);
    constructor(date?: Date);
    /**
     * Determines if an object's date is set
     */
    hasDate(): boolean;
    getUserTimeZone(): TimeZone;
    static excludeZFromFormat(format?: string): string;
    setValue(o?: any): void;
    /**
     * Sets a date and time value using the UTC time zone and the specified date and time format
     */
    setValueUTC(dt?: string, format?: string): void;
    /**
     * Sets the date and time
     */
    setValue(number?: number): void;
    /**
     * Sets the date and time of the current object using an existing GlideDateTime object. This method is equivalent to
     * instantiating a new object with a GlideDateTime parameter
     */
    setGlideDateTime(g?: GlideDateTime): void;
    /**
     * Determines if an object's time uses a daylight savings offset
     */
    isDST(): boolean;
    /**
     * Gets the amount of time that daylight savings time is offset
     */
    getDSTOffset(): number;
    /**
     * Sets a date and time value using the current user's display format and time zone. Also set an optional parameter
     * 'format', to set date and time format
     */
    setDisplayValue(asDisplayed?: string): void;
    /**
     * Sets a date and time value using the internal format and the current user's time zone
     */
    setDisplayValueInternal(value?: string): void;
    setDisplayValueInternalWithAlternates(value?: string): void;
    /**
     * Gets the datetime in the current user's display format and time zone
     */
    getDisplayValue(): string;
    getDisplayValueLang(style?: string): string;
    getDisplayValueLang(style?: string, language?: string): string;
    getDisplayValueWithoutTZ(): string;
    /**
     * Gets the display value in the internal datetime format
     */
    getDisplayValueInternal(): string;
    /**
     * Gets a datetiime value in the same format as it is stored in the database
     */
    getValue(): string;
    getUTCValue(): string;
    /**
     * Compares two GlideDateTime objects
     */
    compareTo(o?: any): number;
    getDayOfWeek(): number;
    /**
     * Gets the day of the week stored by the GlideDateTime object, expressed in the user's time zone
     */
    getDayOfWeekLocalTime(): number;
    /**
     * Gets the day of the week stored by the GlideDateTime object, expressed in the UTC time zone
     */
    getDayOfWeekUTC(): number;
    /**
     * Gets the number of the week stored by the GlideDateTime object, expressed in the user's time zone
     */
    getWeekOfYearLocalTime(): number;
    /**
     * Gets the number of the current week of the current year
     */
    getWeekOfYearUTC(): number;
    getSpanTime(dayofweek?: number): GlideTime;
    getDayOfMonth(): number;
    /**
     * Gets the day of the month stored by the GlideDateTime object, expressed in the current user's time zone
     */
    getDayOfMonthLocalTime(): number;
    /**
     * Gets the day of the month stored by the GlideDateTime object, expressed in the UTC time zone
     */
    getDayOfMonthUTC(): number;
    setDayOfMonth(day?: number): void;
    /**
     * Sets the day of the month to a specified value in the local time zone
     */
    setDayOfMonthLocalTime(day?: number): void;
    /**
     * Sets the day of the month to a specified value in the UTC time zone
     */
    setDayOfMonthUTC(day?: number): void;
    getDaysInMonth(): number;
    /**
     * Sets the day of the month to a specified value in the user's time zone
     */
    getDaysInMonthLocalTime(): number;
    /**
     * Gets the number of days in the month stored by the GlideDateTime object, expressed in the UTC time zone
     */
    getDaysInMonthUTC(): number;
    getMonth(): number;
    /**
     * Gets the month stored by the GlideDateTime object, expressed in the current user's time zone
     */
    getMonthLocalTime(): number;
    /**
     * Gets the month stored by the GlideDateTime object, expressed in the UTC time zone
     */
    getMonthUTC(): number;
    setMonth(month?: number): void;
    /**
     * Sets the month stored by the GlideDateTime object to a specified value using the current user's time zone
     */
    setMonthLocalTime(month?: number): void;
    /**
     * Sets the month stored by the GlideDateTime object to a specified value using the UTC time zone
     */
    setMonthUTC(month?: number): void;
    getYear(): number;
    /**
     * Gets the year stored by the GlideDateTime object, expressed in the current user's time zone
     */
    getYearLocalTime(): number;
    /**
     * Gets the year stored by the GlideDateTime object, expressed in the UTC time zone
     */
    getYearUTC(): number;
    setYear(year?: number): void;
    /**
     * Sets the year stored by the GlideDateTime object to a specified value using the current user's time zone
     */
    setYearLocalTime(year?: number): void;
    /**
     * Sets the year stored by the GlideDateTime object to a specified value using the UTC time zone
     */
    setYearUTC(year?: number): void;
    /**
     * Gets the number of milliseconds since January 1, 1970, 00?:00:00 Greenwich Mean Time (GMT)
     */
    getNumericValue(): number;
    getCalendarInTimeZone(timeZone?: string): Calendar;
    setNumericValue(l?: number): void;
    /**
     * Returns a GlideTime object that represents the time portion of the GlideDateTime object
     */
    getTime(): GlideTime;
    getInternalMidnight(iday?: number): GlideDateTime;
    getUTCMidnight(dayofweek?: number): GlideDateTime;
    /**
     * Returns a GlideTime object that represents the time portion of the GlideDateTime object in the user's time zone
     */
    getLocalTime(): GlideTime;
    /**
     * Gets the date in the system time zone
     */
    getDate(): GlideDate;
    /**
     * Gets the date for the user's time zone
     */
    getLocalDate(): GlideDate;
    /**
     * Converts a datetime value to a string
     */
    toString(): string;
    getRaw(): Date;
    /**
     * Adds a GlideTime object to the current GlideDateTime object
     */
    add(gd?: GlideTime): void;
    addDays(amount?: number): void;
    /**
     * Adds a specified number of days to the current GlideDateTime object, expressed in the user's timezone
     */
    addDaysLocalTime(amount?: number): void;
    /**
     * Adds a specified number of days to the current GlideDateTime object, expressed in the UTC time zone
     */
    addDaysUTC(amount?: number): void;
    addWeeks(amount?: number): void;
    /**
     * Adds a specified number of weeks to the current GlideDateTime object, expressed in the user's timezone
     */
    addWeeksLocalTime(amount?: number): void;
    /**
     * Adds a specified number of weeks to the current GlideDateTime object, expressed in the UTC time zone
     */
    addWeeksUTC(amount?: number): void;
    addMonths(amount?: number): void;
    /**
     * Adds a specified number of months to the current GlideDateTime object, expressed in the user's time zone
     */
    addMonthsLocalTime(amount?: number): void;
    /**
     * Adds a specified number of months to the current GlideDateTime object, expressed in the UTC time zone
     */
    addMonthsUTC(amount?: number): void;
    addYears(amount?: number): void;
    /**
     * Adds a specified number of years to the current GlideDateTime object, expressed in the user's time zone
     */
    addYearsLocalTime(amount?: number): void;
    /**
     * Adds a specified number of years to the current GlideDateTime object, expressed in the UTC time zone
     */
    addYearsUTC(amount?: number): void;
    /**
     * Gets the duration difference between two GlideDateTime values. Pass a single paramter which specifies
     * milliseconds to subtract from the current GlideDateTime object
     */
    subtract(gd?: GlideTime): void;
    static subtract(start?: GlideDateTime, end?: GlideDateTime): GlideDuration;
    /**
     * Determines if a value is a valid datetime
     */
    isValid(): boolean;
    /**
     * Gets the current error message
     */
    getErrorMsg(): string;
    setXMLValue(xml?: string): void;
    getXMLValue(): string;
    add(value?: number): void;
    /**
     * Adds a specified number of seconds to the current GlideDateTime object
     */
    addSeconds(value?: number): void;
    subtract(value?: number): void;
    subtract(value?: number): void;
    setTimeZone(timeZoneAsString?: string): boolean;
    setTZ(tz?: TimeZone): void;
    setDebugTZ(debugTZ?: TimeZone): void;
    getTZOffset(): number;
    setInitialValue(value?: string): void;
    hashCode(): number;
    equals(o?: any): boolean;
    setDisplayValue(value?: string, format?: string): void;
    setDisplayValueLang(asDisplayed?: string, style?: string): void;
    setDisplayValueLang(asDisplayed?: string, style?: string, language?: string): void;
    /**
     * Returns true if the object's data time is after the input argument
     */
    after(gdt?: GlideDateTime): boolean;
    /**
     * Returns true if the object's data time is before the input argument
     */
    before(gdt?: GlideDateTime): boolean;
    /**
     * Returns true if the object's data time is on or after the input argument
     */
    onOrAfter(gdt?: GlideDateTime): boolean;
    /**
     * Returns true if the object's data time is on or before the input argument
     */
    onOrBefore(gdt?: GlideDateTime): boolean;
    /**
     * Returns local time with user time format
     */
    getUserFormattedLocalTime(): string;
    /**
     * Returns local time with internal time format
     */
    getInternalFormattedLocalTime(): string;
    getCounter(): Counter;
}
/**
 * The Scoped GlideDBFunctionBuilder provides a builder API for creating platform function definition
 */
declare class GlideDBFunctionBuilder {
    /**
     * Return the completed function definition
     */
    build(): string;
    /**
     * Add a field parameter to the current function
     */
    field(field?: string): GlideDBFunctionBuilder;
    /**
     * Add a constant parameter to the current function
     */
    constant(constant?: string): GlideDBFunctionBuilder;
    /**
     * End the current function
     */
    endfunc(): GlideDBFunctionBuilder;
    /**
     * Start a length function
     */
    length(): GlideDBFunctionBuilder;
    /**
     * Start a concatenation function
     */
    concat(): GlideDBFunctionBuilder;
    /**
     * Start an addition function
     */
    add(): GlideDBFunctionBuilder;
    /**
     * Start a subtraction function
     */
    subtract(): GlideDBFunctionBuilder;
    /**
     * Start a multiplication function
     */
    multiply(): GlideDBFunctionBuilder;
    /**
     * Start a division function
     */
    divide(): GlideDBFunctionBuilder;
    /**
     * Start a function that return the duration between 2 dates
     */
    datediff(): GlideDBFunctionBuilder;
    /**
     * Start a function that returns the day of the week of a given date
     */
    dayofweek(): GlideDBFunctionBuilder;
    /**
     * Start a function that returns the current timestamp in the UTC timezone. This function should be used as a
     * parameter to the datediff function to calculate a duration between the current datetime and...
     */
    now(): GlideDBFunctionBuilder;
    /**
     * Start a function that will return the first non-null value in a list of values
     */
    coalesce(): GlideDBFunctionBuilder;
    /**
     * Start a function that will return the first occurrence of a substring within a string. Takes optional search
     * start position as third arg.
     */
    position(): GlideDBFunctionBuilder;
    /**
     * Start a function that will return a substring when given a string and an integer position. Optionally a third
     * length parameter can be included to limit the length of the resulting substring.
     */
    substring(): GlideDBFunctionBuilder;
    jsonValue(): GlideDBFunctionBuilder;
    greatest(): GlideDBFunctionBuilder;
    least(): GlideDBFunctionBuilder;
    caseFunc(): GlideDBFunctionBuilder;
    compare(): GlideDBFunctionBuilder;
    andFunc(): GlideDBFunctionBuilder;
    orFunc(): GlideDBFunctionBuilder;
    toGeoPoint(): GlideDBFunctionBuilder;
    getLongitude(): GlideDBFunctionBuilder;
    getLatitude(): GlideDBFunctionBuilder;
    constructor();
}
/** ServiceNow processors are equivalent to Java servlets. Processors provide a customizable URL endpoint that can execute arbitrary server-side Javascript code and produce output such as TEXT, JSON, or HTML. The GlideServletRequest API is used in processor scripts to access the HttpServletRequest object. The GlideServletRequest object provides a subset of the HttpServletRequest APIs. The methods are called using the global variable g_request. A useful global variable, g_target, is available in processor scripts. It contains the table name extracted from the URL. The URL to a processor has the format: https://<instance name.servicenow.com>/<path endpoint>.do?<parameter endpoint>=<value> where the path endpoint and parameter endpoint are defined on the processor form */
declare class GlideServletRequest {
    /** Returns the content type */
    getContentType(): string;
    /** Returns the header */
    getHeader(name?: string): string;
    /** Returns an array of headers as a string */
    getHeaders(name?: string): [
        string
    ];
    /** Returns an array of header names as a string */
    getHeaderNames(): [
        string
    ];
    /** Returns an object */
    getParameter(name?: string): any;
    /** Returns an array of parameter names as a string */
    getParameterNames(): [
        string
    ];
    /** Returns the query string from the request */
    getQueryString(): string;
    constructor();
}
declare class GlideSystemLogger {
    /**
     * Uses the error level to log a message to the system log
     */
    error(message?: string, parm1?: any, parm2?: any, parm3?: any, parm4?: any, parm5?: any): void;
    /**
     * Uses the warn level to log a message to the system log
     */
    warn(message?: string, parm1?: any, parm2?: any, parm3?: any, parm4?: any, parm5?: any): void;
    /**
     * Uses the info level to log a message to the system log
     */
    info(message?: string, parm1?: any, parm2?: any, parm3?: any, parm4?: any, parm5?: any): void;
    /**
     * Uses the debug level to log a message to the system log
     */
    debug(message?: string, parm1?: any, parm2?: any, parm3?: any, parm4?: any, parm5?: any): void;
    isDebugging(): boolean;
    enableSessionScopeDebug(scopeName?: string): void;
    disableSessionScopeDebug(scopeName?: string): void;
    isSessionScopeDebugging(scopeName?: string): boolean;
    constructor();
}
/**
 * The scoped XMLNode API allows you to query values from XML nodes.
 * XMLNodes are extracted from XMLDocument2 objects, which contain XML strings
 */
declare class XMLNode {
    constructor();
    /**
     * Gets the node's text content
     */
    getTextContent(): string;
    /**
     * Gets the node's last child node
     */
    getLastChild(): XMLNode;
    /**
     * Gets the node's first child node
     */
    getFirstChild(): XMLNode;
    /**
     * Gets the node's XMLNodeIterator object
     */
    getChildNodeIterator(): XMLNodeIterator;
    /**
     * Gets the node's value
     */
    getNodeValue(): string;
    /**
     * Gets the node's name
     */
    getNodeName(): string;
    /**
     * Append the given XMLNode as a child node
     */
    appendChild(newChild?: any): void;
    /**
     * Determines if the node has the specified attribute
     */
    hasAttribute(attribute?: string): boolean;
    getAttributes(): Map<string, string>;
    /**
     * Gets the value of the specified attribute
     */
    getAttribute(attribute?: string): string;
    /**
     * Sets the value of the specified attribute
     */
    setAttribute(attribute?: string, value?: string): void;
    isCDATANode(): boolean;
    /**
     * Gets the node's string value
     */
    toString(): string;
}
declare class GlideSystemLoader {
    updateSave(o?: any): void;
    loadUpdates(o?: any): void;
    loadFixes(o?: any): void;
    appUpdate(dirName?: string): void;
    appLoad(dirName?: string): void;
    appLoadData(dirName?: string): void;
    appUpgrade(dirName?: string): void;
    indexUpdate(dirName?: string): void;
    appLoadDemo(dirName?: string): void;
    load(fileName?: string): void;
    loadResource(pluginName?: string, resourcePath?: string): void;
    setCleaningDemoData(cleaning?: boolean): void;
    isCleaningDemoData(): boolean;
    unload(tableName?: string, fileName?: string): void;
    updateUnload(): void;
    unloadChoices(tableName?: string, fieldName?: string, baseline?: string): void;
    unloadWithQuery(tableName?: string, fileName?: string, query?: string): void;
    unloadAll(path?: string): void;
    unloadRecordToXML(o?: any, indent?: boolean): string;
    constructor();
}
/**
 * Scoped GlideRecord is used for database operations instead of writing SQL queries. Provides data access APIs to
 * retrieve, update, and delete records from a table
 */
declare interface GlideRecordGenerated {
    getViewDefinition(): DBViewDefinition;
    setViewDefinition(viewDefinition?: DBViewDefinition): void;
    getViewDefinitionUniqueValueMap(): any;
    static newGlideRecordNamed(tableName?: string): ㅤGlideRecord;
    largeResultExpected(): void;
    targetExtension(tableName?: string): void;
    /**
     * Retrieves the query condition of the current result set as an encoded query string
     */
    getEncodedQuery(): string;
    /**
     * Retrieves the class name for the current record
     */
    getRecordClassName(): string;
    putCurrent(): void;
    popCurrent(): void;
    createElement(): boolean;
    updateElement(): boolean;
    createIndex(): boolean;
    dropIndex(): boolean;
    /**
     * Defines a GlideRecord based on the specified expression of name = value
     */
    get(name?: any, value?: any): boolean;
    _get(name?: any, value?: any): boolean;
    evaluateAsDefault(fieldName?: string): string;
    /**
     * Adds a filter to return records based on a relationship in a related table
     */
    addJoinQuery(joinTable?: string, primaryField?: any, joinTableField?: any): IQueryCondition;
    /**
     * Adds a filter to return records by specifying a field and value. You can use an optional 'operator' as a second
     * parameter
     */
    addQuery(name?: string, operator?: any, value?: any): IQueryCondition;
    addUserQuery(name?: string, operator?: any, value?: any): IQueryCondition;
    /**
     * Adds a filter to return records where the specified field is null
     */
    addNullQuery(fieldName?: string): QueryCondition;
    /**
     * Adds a filter to return records where the specified field is not null
     */
    addNotNullQuery(fieldName?: string): QueryCondition;
    appendOrQuery(condition?: any, name?: string, operator?: any, value?: any): void;
    /**
     * Adds a filter to return active records
     */
    addActiveQuery(): QueryCondition;
    addInactiveQuery(): QueryCondition;
    /**
     * Specifies an orderBy column
     */
    orderBy(name?: string): void;
    /**
     * Specifies a descending orderBy
     */
    orderByDesc(name?: string): void;
    /**
     * Adds an encoded query to the other queries that may have been set
     */
    addEncodedQuery(query?: string, enforceFieldACLs?: any): void;
    isEncodedQueryValid(query?: string): boolean;
    isValidEncodedQuery(query?: string): boolean;
    moreEncodedQuery(query?: string): void;
    /**
     * Sets the maximum number of records in the GlideRecord to be fetched in the next query
     */
    setLimit(limit?: number): void;
    /**
     * Sets a range of rows to be returned by subsequent queries. If forceCount is true, getRowCount() method will
     * return all possible records
     */
    chooseWindow(f?: number, l?: number, forceCount?: boolean): void;
    applyRowSecurity(): void;
    /**
     * Runs the query against the table based on the specified filters by addQuery and addEncodedQuery
     */
    query(field?: any, value?: any): void;
    _query(field?: any, value?: any): void;
    queryNoDomain(): void;
    getSetRowCount(): number;
    /**
     * Retrieves the number of rows in the GlideRecord
     */
    getRowCount(): number;
    getRowNumber(): number;
    isForeignTable(): boolean;
    isMetadata(): boolean;
    isValidMetadataRecord(): boolean;
    getRelatedRecords(foreignKey?: string, collectionID?: string): void;
    disableSysIdInOptimization(): void;
    putOptimizers(o?: any): void;
    isView(): boolean;
    isReadonly(): boolean;
    makeReadonly(): void;
    getRelatedTables(): HashMap<string, string>;
    getRelatedLists(): HashMap;
    /**
     * The label of the field as a String
     */
    getLabel(): string;
    getPlural(): string;
    /**
     * Updates the current GlideRecord with any changes that have been made
     */
    update(reason?: any): string;
    updateWithReferences(reason?: any): string;
    updateLazy(): boolean;
    updateNoDomain(reason?: any): string;
    scheduleScript(name?: string): void;
    /**
     * Creates an empty record suitable for population before an insert
     */
    initialize(): void;
    applyTemplate(template?: string): void;
    insertLazy(): string;
    /**
     * Retrieves the current operation being performed, such as insert, update, or delete
     */
    operation(): string;
    /**
     * Insert a new record using the field values that have been set for the current record
     */
    insert(): string;
    insertWithReferences(): string;
    insertOrUpdate(keyField?: string): string;
    /**
     * Deletes the current record
     */
    deleteRecord(): boolean;
    incrementViewCount(): void;
    /**
     * Deletes records that satisfy current query condition
     */
    deleteMultiple(): void;
    addValue(field?: string, value?: number): void;
    /**
     * Updates each GlideRecord in the list with any changes that have been made
     */
    updateMultiple(): void;
    updateMultipleAllowNull(allowNull?: boolean): void;
    /**
     * Moves to the next record in the GlideRecord
     */
    next(): boolean;
    nextRecord(): boolean;
    _next(): boolean;
    _operation(): string;
    /**
     * Determines if there are any more records in the GlideRecord
     */
    hasNext(): boolean;
    /**
     * Creates a new GlideRecord, sets the default values for the fields, and assigns a unique ID to the record
     */
    newRecord(): void;
    saveLocation(): void;
    setLocation(rowNumber?: number): void;
    restoreLocation(): void;
    getLocation(): number;
    /**
     * Retrieves the display value for the current record
     */
    getDisplayValue(name?: string): string;
    getEscapedDisplayValue(): string;
    getClassDisplayValue(): string;
    getFields(): ArrayList;
    getRequestedElements(): GlideElement[];
    findForeignKey(collection?: string): string;
    close(): void;
    /**
     * Retrieves the table name associated with this GlideRecord
     */
    getTableName(): string;
    find(columnName?: string, value?: string): boolean;
    getGeoPoint(name?: string, order?: any): GlideGeoPoint;
    /**
     * Sets the value for the specified field.
     */
    setValue(name?: string, value?: any): void;
    /**
     * Sets the display value for the specified Dynamic Attribute.
     */
    setDynamicAttributeDisplayValue(arg1?: string, arg2?: any, arg3?: any): boolean;
    /**
     * Sets the value for the specified Dynamic Attribute.
     */
    setDynamicAttributeValue(arg1?: string, arg2?: any, arg3?: any): boolean;
    /**
     * Sets the display values of the specified Dynamic Attributes.
     */
    setDynamicAttributeDisplayValues(jsonField?: string, values?: any): void;
    /**
     * Sets the values of the specified Dynamic Attributes.
     */
    setDynamicAttributeValues(jsonField?: string, values?: any): void;
    getDynamicAttribute(arg1?: string, arg2?: any): any;
    getDynamicAttributeValue(arg1?: string, arg2?: any): any;
    getDynamicAttributeDisplayValue(arg1?: string, arg2?: any): any;
    setDisplayValue(name?: string, value?: any): void;
    /**
     * Retrieves the underlying value of a field
     */
    getValue(name?: string): string;
    /**
     * Gets the primary key of the record, which is usually the sys_id unless otherwise specified
     */
    getUniqueValue(): string;
    /**
     * Sets a flag to indicate if the next database action (insert, update, delete) is to be aborted
     */
    setAbortAction(b?: boolean): void;
    /**
     * Determines whether the current database action is to be aborted. Available in Fuji patch 3
     */
    isActionAborted(): boolean;
    instanceOf(className?: string): boolean;
    hasClass(className?: string): boolean;
    /**
     * Determines whether the table exists or not
     */
    isValid(): boolean;
    /**
     * Determines if current record is a valid record
     */
    isValidRecord(): boolean;
    /**
     * Checks if the current record is a new record that has not yet been inserted into the database
     */
    isNewRecord(): boolean;
    hasAttachments(): boolean;
    applyEncodedQuery(queryString?: string): void;
    /**
     * Retrieves the name of the display field
     */
    getDisplayName(): string;
    /**
     * Sets sys_id value for the current record
     */
    setNewGuid(): string;
    setNewGuidValue(guid?: string): void;
    isWorkflow(): boolean;
    setEngineParameter(name?: string, value?: string): void;
    getEngineParameter(name?: string): string;
    enableSecurityFeature(feature?: string): void;
    disableSecurityFeature(feature?: string): void;
    setUseEngines(e?: boolean): void;
    /**
     * Enables and disables the running of business rules and script engines. When disabled, inserts and updates are not
     * audited
     */
    setWorkflow(e?: boolean): void;
    setForceUpdate(e?: boolean): void;
    getED(): ElementDescriptor;
    /**
     * Gets the attributes on the field in question from the dictionary
     */
    getAttribute(attribute?: string): string;
    getBooleanAttribute(attribute?: string): boolean;
    /**
     * Determines if the Access Control Rules which include the user's roles permit editing records in this table
     */
    canWrite(): boolean;
    /**
     * Determines if the Access Control Rules which include the user's roles permit inserting new records in this table
     */
    canCreate(): boolean;
    /**
     * Determines if the Access Control Rules which include the user's roles permit reading records in this table
     */
    canRead(): boolean;
    notifyUser(): void;
    hasRightsTo(operation?: string): boolean;
    /**
     * Determines if the Access Control Rules which include the user's roles permit deleting records in this table
     */
    canDelete(): boolean;
    /**
     * Determines if the given field is defined in the current table
     */
    isValidField(columnName?: string): boolean;
    /**
     * Retrieves the GlideElement for a specified field
     */
    getElement(columnName?: string): GlideElement;
    /**
     * Retrieves the last error message
     */
    getLastErrorMessage(): string;
    /**
     * Retrieves a link to the current record
     */
    getLink(noStack?: boolean): string;
    setQueryReferences(queryReferences?: boolean): void;
    enableSessionLanguageJoin(): void;
    attachGlideListener(className?: string, insert?: boolean, update?: boolean, delete_?: boolean, fields?: string, foreign?: any, foreign2?: any, details?: string): void;
    addExtraField(field?: string): void;
    setSystem(isSystem?: boolean): void;
    autoSysFields(b?: boolean): void;
    changes(): boolean;
    getElements(): ArrayList;
    addDomainQuery(o?: any): void;
    setNoCount(): void;
    onePassQuery(): void;
    /**
     * Sets the value of category for the query
     */
    setCategory(category?: string): void;
    /**
     * Gets the optional category value of the query
     */
    getCategory(): string;
    isInGlobalScope(): boolean;
    isInStoreScope(): boolean;
    isInSelectedScope(): boolean;
    getTableScope(): string;
    getTableScopeName(): string;
    getTableScopeId(): string;
    /**
     * Retrieve the specified platform function in addition of the field values
     */
    addFunction(function_?: string): void;
    addQueryHint(name?: string, value?: any): void;
    isDataFabricOperation(): boolean;
    constructor();
}
/** Web Services API, to send a message to a web service provider */
declare namespace sn_ws { /** Instantiates a RESTMessageV2 object. When you have a REST message record, you can add the optional name and methodName information */
    class RESTMessageV2 {
        /** Send the REST message to the endpoint */
        execute(): sn_ws.RESTResponseV2;
        /** Send the REST message to the endpoint asynchronously. The instance does not wait for a response from the web service provider when making asynchronous calls */
        executeAsync(): sn_ws.RESTResponseV2;
        /** The HTTP method this REST message performs, such as GET or PUT. You must set an HTTP method when using the RESTMessageV2() constructor with no parameters */
        setHttpMethod(method?: string): void;
        /** Set the amount of time the REST message waits for a response from the REST provider */
        setHttpTimeout(timeoutMs?: number): void;
        /** Set basic authentication headers for the REST message */
        setBasicAuth(userName?: string, userPass?: string): void;
        /** Set the mutual authentication protocol profile for the REST message */
        setMutualAuth(profileName?: string): void;
        /** Set the credentials for the REST message using an existing basic auth or OAuth 2.0 profile. Valid types are 'basic' and 'oauth2'. Valid profileIds are the sys_id of a Basic Auth Configuration [sys_auth_profile_basic] record or an OAuth Entity Profile [oauth_entity_profile] record */
        setAuthenticationProfile(type?: string, profileId?: string): void;
        /** Associate outbound requests and the resulting response record in the ECC queue */
        setEccCorrelator(correlator?: string): void;
        /** Override a value from the database by writing to the REST message payload */
        setEccParameter(name?: string, value?: string): void;
        /** Configure the REST message to communicate through a MID Server */
        setMIDServer(midServer?: string): void;
        /** Set the endpoint for the REST message */
        setEndpoint(endpoint?: string): void;
        /** Set the ECC topic for the REST message. The default ECC topic is RESTProbe if topic is not set. In most cases it is unnecessary to set ECC topic */
        setEccTopic(topic?: string): void;
        /** Set the body content of a PUT or POST request. Mutually exclusive with setRequestBodyFromAttachment */
        setRequestBody(body?: string): void;
        /** Uses the specified attachment as the request body of this REST Message. Mutually exclusive with setRequestBody */
        setRequestBodyFromAttachment(attachmentSysId?: string): void;
        /** Setup the response body to be saved into the specified attachment when the request is sent. encryptCtxSysId is optional */
        saveResponseBodyAsAttachment(tableName?: string, recordSysId?: string, filename?: string, encryptCtxSysId?: string): void;
        /** Set an HTTP header to the specified value */
        setRequestHeader(name?: string, value?: string): void;
        /** Set a REST message function variable to the specified value */
        setStringParameter(name?: string, value?: string): void;
        /** Set a REST message function variable to the specified value without escaping XML reserved characters */
        setStringParameterNoEscape(name?: string, value?: string): void;
        /** Append a name-value parameter to the request URL */
        setQueryParameter(name?: string, value?: string): void;
        /** Get the content of the REST message body */
        getRequestBody(): string;
        /** Get the URL of the endpoint for the REST message */
        getEndpoint(): string;
        /** Get the ECC topic for the REST message */
        getEccTopic(): string;
        /** Get the value for an HTTP header specified by the REST client */
        getRequestHeader(headerName?: string): string;
        /** Get name and value for all HTTP headers specified by the REST client */
        getRequestHeaders(): Object;
        constructor(name?: string, methodName?: string);
    }
    /** The RESTResponseV2 API allows you to use the data returned by an outbound REST message in JavaScript code. A RESTResponseV2 object is returned by the RESTMessageV2 functions execute() and executeAsync() */
    class RESTResponseV2 {
        /** Set the amount of time the instance waits for the response */
        waitForResponse(timeoutSecs?: number): void;
        /** Get the numeric HTTP status code returned by the REST provider */
        getStatusCode(name?: string): number;
        /** Get the value for a specified header */
        getHeader(name?: string): string;
        /** Deprecated -- use getAllHeaders instead */
        getHeaders(): Object;
        /** Get all headers returned in the REST response and the associated values */
        getAllHeaders(): [
            GlideHTTPHeader
        ];
        /** Get the content of the REST response body */
        getBody(): string;
        /** Indicate if there was an error during the REST transaction */
        haveError(): boolean;
        /** Get the numeric error code, if there was an error during the REST transaction */
        getErrorCode(): number;
        /** Get the error message if there was an error during the REST transaction */
        getQueryString(): string;
        /** Get the query used for this request */
        getErrorMessage(): string;
        constructor();
    }
    /** Instantiates a SOAPMessageV2 object. Specify optional message and a function if there is a SOAP message record */
    class SOAPMessageV2 {
        /** Send the SOAP Message to the endpoint */
        execute(): sn_ws.SOAPResponse;
        /** Send the SOAP Message to the endpoint asynchronously */
        executeAsync(): sn_ws.SOAPResponse;
        /** Define the SOAP action this SOAP message performs */
        setSOAPAction(soapAction?: string): void;
        /** Set the amount of time the request waits for a response from the web service provider before the request times out */
        setHttpTimeout(timeoutMs?: number): void;
        /** Set basic authentication headers for the SOAP message */
        setBasicAuth(userName?: string, userPass?: string): void;
        /** Set the mutual authentication protocol profile for the SOAP message */
        setMutualAuth(profileName?: string): void;
        /** Set web service security values for the SOAP message */
        setWSSecurity(keystoreId?: string, keystoreAlias?: string, keystorePassword?: string, certificateId?: string): void;
        /** Set a variable from the SOAP message record to the specified value */
        setStringParameter(name?: string, value?: string): void;
        /** Set a variable from the SOAP message record to the specified value without escaping XML reserved characters */
        setStringParameterNoEscape(name?: string, value?: string): void;
        /** Associate outbound requests and the resulting response record in the ECC queue */
        setEccCorrelator(correlator?: string): void;
        /** Override a value from the database by writing to the SOAP message payload */
        setEccParameter(name?: string, value?: string): void;
        /** Set an HTTP header in the SOAP message to the specified value */
        setRequestHeader(headerName?: string, headerValue?: string): void;
        /** Set the body content to send to the web service provider */
        setRequestBody(requestBody?: string): void;
        /** Set the endpoint for the SOAP message */
        setEndpoint(endpoint?: string): void;
        /** Configure the SOAP message to be sent through a MID Server */
        setMIDServer(midServerName?: string): void;
        /** Get the content of the SOAP message body */
        getRequestBody(): string;
        /** Get the URL of the endpoint for the SOAP message */
        getEndpoint(): string;
        /** Get the value for an HTTP header specified by the SOAP client */
        getRequestHeader(headerName?: string): string;
        /** Get name and value for all HTTP headers specified by the SOAP client */
        getRequestHeaders(): Object;
        /** Set WS-Security Username token */
        setWSSecurityUsernameToken(username?: string, password?: string): void;
        /** Set WS-Security X.509 token */
        setWSSecurityX509Token(keystoreId?: string, keystoreAlias?: string, keystorePassword?: string, certificateId?: string): void;
        constructor(soapMessage?: string, soapFunction?: string);
    }
    /** The SOAPResponseV2 API allows you to use the data returned by an outbound SOAP message in JavaScript code. A SOAPResponseV2 object is returned by the SOAPMessageV2 functions execute() and executeAsync() */
    class SOAPResponseV2 {
        /** Set the amount of time the instance waits for a response */
        waitForResponse(timeoutSecs?: number): void;
        /** Get the numeric HTTP status code returned by the SOAP provider */
        getStatusCode(): number;
        /** Get the value for a specified HTTP header */
        getHeader(name?: string): void;
        /** Deprecated -- use getAllHeaders instead */
        getHeaders(): Object;
        /** Get all HTTP headers returned in the SOAP response and the associated values */
        getAllHeaders(): [
            GlideHTTPHeader
        ];
        /** Get the content of the SOAP response body */
        getBody(): string;
        /** Indicate if there was an error during the SOAP transaction */
        haveError(): boolean;
        /** Get the numeric error code if there was an error during the SOAP transaction */
        getErrorCode(): number;
        /** Get the error message if there was an error during the SOAP transaction */
        getErrorMessage(): string;
        constructor();
    }
}
declare class DynamicSchemaAPI {
    static get(): DynamicSchemaAPI;
    static get(): DynamicSchemaAPI;
    clearDynamicAttributeGroupCache(): void;
    clearDynamicAttributeGroupCacheItem(groupId?: string): void;
    clearDynamicCategoryCache(): void;
    clearDynamicCategoryCacheItem(categoryId?: string): void;
    clearDynamicChoiceSetCache(): void;
    clearDynamicChoiceSetCacheItem(choiceSetId?: string): void;
    jsFunction_getValidScopedGroupName(scopeId?: string, groupName?: string): string;
    getValidScopedGroupName(scopeId?: string, groupName?: string): string;
    jsFunction_getValidScopedAttributeName(scopeId?: string, groupId?: string, attributeName?: string): string;
    getValidScopedAttributeName(scopeId?: string, groupId?: string, attributeName?: string): string;
    getAvailableAttributeGroupsForTable(tableName?: string, tableSysId?: string, throwExceptionsOnBadData?: boolean): string;
    constructor();
}
/**
 * The scoped QueryCondition API provides additional AND or OR conditions that can be added to the current condition,
 * allowing you to build complex queries such as: category='hardware' OR category='sof...
 */
declare interface GlideQueryConditionGenerated extends DeepClonable {
    constructor();
    /**
     * Adds an OR condition to the current condition. oper is an optional parameter
     */
    addOrCondition(name?: string, value?: any): IQueryCondition;
    /**
     * Adds an OR condition to the current condition. oper is an optional parameter
     */
    addOrCondition(name?: string, oper?: string, value?: any): IQueryCondition;
    /**
     * Adds an OR condition to the current condition. oper is an optional parameter
     */
    addOrCondition(or?: IQueryCondition): void;
    /**
     * Adds an AND condition to the current condition. oper is an optional parameter
     */
    addCondition(name?: string, value?: any): IQueryCondition;
    /**
     * Adds an AND condition to the current condition. oper is an optional parameter
     */
    addCondition(name?: string, oper?: string, value?: any): IQueryCondition;
    /**
     * Adds an AND condition to the current condition. oper is an optional parameter
     */
    addCondition(and?: IQueryCondition): void;
}
/**
 * The scoped GlideElementDescriptor class provides information about individual fields
 */
declare class GlideElementDescriptor {
    constructor();
    constructor(name?: string, type?: string, length?: number);
    toSQLType(dbi?: DBI): string;
    /**
     * Returns the field's length
     */
    getLength(): number;
    /**
     * Returns the field's name
     */
    getName(): string;
    getColumnName(): string;
    getType(): number;
    serializeAttributes(): string;
    getUniqueID(): string;
    isMandatory(): boolean;
    /**
     * Returns the field's data type
     */
    getInternalType(): string;
    setInternalType(s?: string): void;
    isVirtual(): boolean;
    isActive(): boolean;
    isInDatabase(): boolean;
    getReference(): string;
    getReferenceKey(): string;
    setIsReference(b?: boolean): void;
    setName(name?: string): void;
    isObject(): boolean;
    getSchemaTableName(): string;
    getTableName(): string;
    getChoice(): number;
    getDefault(): string;
    getDependent(): string;
    isDisplay(): boolean;
    isReadOnly(): boolean;
    isMultiText(): boolean;
    getReferenceQualifier(): string;
    getScopeID(): string;
    getChoiceTable(): string;
    getSqlLength(): number;
    isTimeType(): boolean;
    isDuration(): boolean;
    isTime(): boolean;
    isDateType(): boolean;
    isMetricType(): boolean;
    isDateOnly(): boolean;
    mergeAttributesWithTables(): GlideAttributes;
    isChoiceTable(): boolean;
    isList(): boolean;
    isJournal(): boolean;
    isEdgeEncryptable(): boolean;
    getEncryptionType(): string;
    isEdgeEncrypted(): boolean;
    getAttachmentEncryptionType(): string;
    hasAttachmentsEncrypted(): boolean;
    isEncrypted(): boolean;
    isReference(): boolean;
    isBoolean(): boolean;
    isString(): boolean;
    isJournalList(): boolean;
    isNumber(): boolean;
    isTrulyNumber(): boolean;
    isAutoOrSysID(): boolean;
    toXML(): Element;
    hasAttribute(attribute?: string): boolean;
    getBooleanAttribute(attribute?: string, def?: boolean): boolean;
    getBooleanAttribute(attribute?: string): boolean;
    getAttribute(name?: string): string;
    getDirectAttribute(name?: string): string;
    toString(): string;
    getPlural(): string;
    /**
     * Returns the field's label
     */
    getLabel(): string;
    getHint(): string;
    canAvg(): boolean;
    canSum(): boolean;
    canMin(): boolean;
    canMax(): boolean;
    getFirstTableName(): string;
    isFirstTableName(): boolean;
    isAdpEncrypted(): boolean;
    isAdpEncryptedDataAllowed(): boolean;
}
declare class GlideSystemDateUtil2 {
    nowDateTime(): string;
    nowGlideDateTime(): GlideDateTime;
    nowNoTZ(): string;
    lastWeek(): string;
    /**
     * Returns a String of the form :interval,value,operator
     */
    datePart(interval?: string, value?: string, oper?: string): string;
    now(): string;
    beginningOfToday(): string;
    beginningOfDay(o?: any): string;
    endOfToday(): string;
    endOfDay(o?: any): string;
    beginningOfYesterday(): string;
    beginningOfTomorrow(): string;
    endOfYesterday(): string;
    endOfTomorrow(): string;
    /**
     * Gets the date and time for the beginning of this week in UTC, adjusted for the timezone of the server
     */
    beginningOfThisWeek(): string;
    /**
     * Returns the (UTC) beginning of the specified week adjusted for the timezone of the current session
     */
    beginningOfWeek(o?: any): string;
    /**
     * Gets the date and time for the end of this week in UTC, adjusted for the timezone of the server
     */
    endOfThisWeek(): string;
    /**
     * Returns the (UTC) end of the specified week adjusted for the timezone of the current session
     */
    endOfWeek(o?: any): string;
    /**
     * Gets the date and time for the beginning of last week in UTC, adjusted for the timezone of the server
     */
    beginningOfLastWeek(): string;
    /**
     * Returns the (UTC) end of last week adjusted for the timezone of the server
     */
    endOfLastWeek(): string;
    /**
     * Gets the date and time for the beginning of next week in UTC, adjusted for the timezone of the server
     */
    beginningOfNextWeek(): string;
    /**
     * Returns the (UTC) end of next week adjusted for the timezone of the server
     */
    endOfNextWeek(): string;
    /**
     * Gets the date and time for the beginning of this month in UTC, adjusted for the timezone of the server
     */
    beginningOfThisMonth(): string;
    beginningOfMonth(o?: any): string;
    /**
     * Gets the date and time for the end of this month in UTC, adjusted for the timezone of the server
     */
    endOfThisMonth(): string;
    endOfMonth(o?: any): string;
    /**
     * Gets the date and time for the beginning of last month in UTC, adjusted for the timezone of the server
     */
    beginningOfLastMonth(): string;
    /**
     * Returns the (UTC) start of the quarter that was the specified number of months ago adjusted for the timezone
     * of the server
     */
    monthsAgo(month?: number): string;
    /**
     * Returns the (UTC) start of the quarter that was the specified number of months ago adjusted for the timezone of
     * the server
     */
    monthsAgoStart(month?: number): string;
    monthsAgoEnd(month?: number): string;
    /**
     * Gets the date and time for the end of last month in UTC, adjusted for the timezone of the server
     */
    endOfLastMonth(): string;
    /**
     * Gets the date and time for the beginning of next month in UTC, adjusted for the timezone of the server
     */
    beginningOfNextMonth(): string;
    /**
     * Gets the date and time for the end of next month in UTC, adjusted for the timezone of the server
     */
    endOfNextMonth(): string;
    /**
     * Gets the date and time for the beginning of this quarter in UTC, adjusted for the timezone of the server
     */
    beginningOfThisQuarter(): string;
    /**
     * Gets the date and time for the end of this quarter in UTC, adjusted for the timezone of the server
     */
    endOfThisQuarter(): string;
    quartersAgo(quarters?: number): string;
    /**
     * Returns the (UTC) start of the quarter that was the specified number of quarters ago adjusted for the timezone
     * of the server
     */
    quartersAgoStart(quarters?: number): string;
    /**
     * Returns the (UTC) end of the quarter that was the specified number of quarters ago adjusted for the timezone of
     * the server
     */
    quartersAgoEnd(quarters?: number): string;
    yearsAgo(year?: number): string;
    /**
     * Gets the date and time for the beginning of last year in UTC, adjusted for the timezone of the server
     */
    beginningOfLastYear(): string;
    /**
     * Gets the date and time for the end of last year in UTC, adjusted for the timezone of the server
     */
    endOfLastYear(): string;
    /**
     * Gets the date and time for the beginning of next year in UTC, adjusted for the timezone of the server
     */
    beginningOfNextYear(): string;
    /**
     * Gets the date and time for the end of next year in UTC, adjusted for the timezone of the server
     */
    endOfNextYear(): string;
    /**
     * Gets the date and time for the beginning of this year in UTC, adjusted for the timezone of the server
     */
    beginningOfThisYear(): string;
    beginningOfYear(o?: any): string;
    /**
     * Gets the date and time for the end of this year in UTC, adjusted for the timezone of the server
     */
    endOfThisYear(): string;
    endOfYear(o?: any): string;
    /**
     * Returns the (UTC) start of the day that was the specified number of days ago adjusted for the timezone of the
     * server
     */
    daysAgo(days?: number): string;
    daysAgoLocal(days?: number): string;
    /**
     * Returns the (UTC) start of the day that was the specified number of days ago adjusted for the timezone of the
     * server
     */
    daysAgoStart(days?: number): string;
    /**
     * Returns the (UTC) end of the day that was the specified number of days ago adjusted for the timezone of the server
     */
    daysAgoEnd(days?: number): string;
    /**
     * number of hours ago
     */
    hoursAgo(hours?: number): string;
    hoursAgoLocal(hours?: number): string;
    /**
     * Returns the (UTC) start of the hour that was the specified number of hours ago adjusted for the timezone of the
     * server
     */
    hoursAgoStart(hours?: number): string;
    /**
     * Returns the (UTC) end of the hour that was the specified number of hours ago adjusted for the timezone of the
     * server
     */
    hoursAgoEnd(hours?: number): string;
    /**
     * number of minutes ago
     */
    minutesAgo(minutes?: number): string;
    /**
     * Returns the (UTC) start of the minute that was the specified number of minutes ago adjusted for the timezone of
     * the serve
     */
    minutesAgoStart(minutes?: number): string;
    /**
     * Returns the (UTC) end of the minute that was the specified number of minutes ago adjusted for the timezone of the
     * serve
     */
    minutesAgoEnd(minutes?: number): string;
    /**
     * Returns (UTC) 24 hours ago adjusted for the timezone of the current session
     */
    yesterday(): string;
    /**
     * Returns the date of the duration time after January 1
     */
    getDurationDate(duration?: string): string;
    dateGenerate(date?: string, range?: string): string;
    dateDiff(startDate?: string, endDate?: string, bnumericValue?: boolean): string;
    calDateDiff(startDate?: string, endDate?: string, numericValue?: boolean): string;
    isFirstDayOfWeek(o?: any): boolean;
    isLastDayOfWeek(o?: any): boolean;
    isFirstDayOfMonth(o?: any): boolean;
    isLastDayOfMonth(o?: any): boolean;
    isFirstDayOfYear(o?: any): boolean;
    isLastDayOfYear(o?: any): boolean;
    dateAdd(unit?: string, offset?: number, basis?: any): string;
    constructor();
}
declare class GlideSystemDateUtil3 {
    beginningOfLast3Months(): string;
    endOfLast3Months(): string;
    beginningOfLast6Months(): string;
    endOfLast6Months(): string;
    beginningOfLast9Months(): string;
    endOfLast9Months(): string;
    beginningOfLast12Months(): string;
    endOfLast12Months(): string;
    beginningOfLastQuarter(): string;
    endOfLastQuarter(): string;
    beginningOfLast2Quarters(): string;
    endOfLast2Quarters(): string;
    beginningOfNextQuarter(): string;
    endOfNextQuarter(): string;
    beginningOfNext2Quarters(): string;
    endOfNext2Quarters(): string;
    beginningOfLast2Years(): string;
    endOfLast2Years(): string;
    beginningOfLast7Days(): string;
    endOfLast7Days(): string;
    beginningOfLast30Days(): string;
    endOfLast30Days(): string;
    beginningOfLast60Days(): string;
    endOfLast60Days(): string;
    beginningOfLast90Days(): string;
    endOfLast90Days(): string;
    beginningOfLast120Days(): string;
    endOfLast120Days(): string;
    beginningOfCurrentHour(): string;
    endOfCurrentHour(): string;
    beginningOfLastHour(): string;
    endOfLastHour(): string;
    beginningOfLast2Hours(): string;
    endOfLast2Hours(): string;
    beginningOfCurrentMinute(): string;
    endOfCurrentMinute(): string;
    beginningOfLastMinute(): string;
    endOfLastMinute(): string;
    beginningOfLast15Minutes(): string;
    endOfLast15Minutes(): string;
    beginningOfLast30Minutes(): string;
    endOfLast30Minutes(): string;
    beginningOfLast45Minutes(): string;
    endOfLast45Minutes(): string;
    beginningOfOneYearAgo(): string;
    endOfOneYearAgo(): string;
    constructor();
}
/** A wrapper around an InputStream. No functions are provided to manipulate the stream from script. Rather this object can be passed to any API which takes an InputStream as an input parameter */
declare class GlideScriptableInputStream {
    constructor();
}
/** These objects are relevant to Scripted GraphQL APIs and are accessed via the env input parameters to Scripted APIs */
declare namespace sn_scripted_gql { /** Allows you to access TypeResolutionEnvironment in Scripted GraphQL APIs */
    class TypeResolutionEnvironment {
        /** The object returned from data fetcher */
        getObject(): void;
        /** Represents the arguments that have been provided on a field */
        getArguments(): void;
        /** Name of Interface or Union GraphQL Type */
        getTypeName(): string;
        constructor();
    }
    /** Allows you to access ResolverEnvironment in Scripted GraphQL APIs */
    class ResolverEnvironment {
        /** Information on the field. It is the result of the parent field fetch */
        getSource(): void;
        /** Represents the arguments that have been provided on a field */
        getArguments(): void;
        constructor();
    }
}
declare class GlideSystemScheduleUtil {
    beginningOfThisSchedulePeriod(scheduleId?: string): string;
    endOfThisSchedulePeriod(scheduleId?: string): string;
    beginningOfLastSchedulePeriod(scheduleId?: string): string;
    endOfLastSchedulePeriod(scheduleId?: string): string;
    beginningOfNextSchedulePeriod(scheduleId?: string): string;
    endOfNextSchedulePeriod(scheduleId?: string): string;
    beginningOfSchedulePeriodsAgo(periodsAgo?: number, scheduleId?: string): string;
    endOfSchedulePeriodsAgo(periodsAgo?: number, scheduleId?: string): string;
    constructor();
}
/**
 * The scoped GlideSystem (referred to by the variable name 'gs' in any server-side
 * JavaScript) API provides a number of convenient methods to get information about
 * the system, the current logged in u...
 */
declare class GlideSystem {
    /**
     * Queues an event for the event manager
     */
    eventQueue(name?: string, instance?: any, parm1?: string, parm2?: string, queue?: string): void;
    /**
     * Determines if a database table exists
     */
    tableExists(name?: string): boolean;
    /**
     * Retrieves the value of the given property.
     */
    getProperty(key?: string, alt?: any): string;
    /**
     * Queries an object and returns true if the object is null, undefined, or contains an empty string
     */
    nil(o?: any): boolean;
    /**
     * Generates a GUID that can be used when a unique identifier is required
     */
    generateGUID(o?: any): string;
    /**
     * Gets the GlideSession Session ID
     */
    getSessionID(): string;
    /**
     * Provides a safe way to call from the sandbox, allowing only trusted scripts to be included
     */
    include(name?: string): boolean;
    /**
     * Gets a reference to the current Glide session
     */
    getSession(): any;
    /**
     * Determines if the current user has the specified role
     */
    hasRole(role?: string): boolean;
    /**
     * Determines if the UI is running as mobile
     */
    isMobile(): boolean;
    /**
     * Gets the name of the current scope
     */
    getCurrentScopeName(): string;
    /**
     * Gets the caller scope name, or returns null if there is no caller
     */
    getCallerScopeName(): string;
    /**
     * Gets a string representing the cache version for a CSS file
     */
    getCssCacheVersionString(theme?: string): string;
    constructor();
}
/**
 * The server-side scripting helper $sp is a collection of methods
 * for developing Service Portal widgets such as getting a widget
 * instance record, getting a JSON-formatted record, or checking
 * if a us...
 */
declare class GlideSPScriptable {
    /**
     * Returns the GlideRecord for the current widget instance.
     */
    getPortalRecord(): ㅤGlideRecord;
    /**
     * Get a value in this order: From the request.
     * From the sp_instance record. From the sp_portal record.
     */
    getValue(name?: string): any;
    /**
     * Get a map of the arguments used to create this widget instance.
     */
    getWidgetParameters(): Scriptable;
    /**
     * Get a display value in this order: From the request.
     * From the sp_instance record. From the sp_portal record.
     */
    getDisplayValue(name?: string): string;
    /**
     * Get values from the sp_instance record and copy them into 'data'.
     * Pass comma-separated 'names' to get values from specific fields.
     */
    getValues(data?: Scriptable, names?: string): void;
    /**
     * Get values from the sp_instance record and copy them into 'data'.
     * Pass comma-separated 'names' to get values from specific fields.
     */
    getValues(data?: Scriptable): void;
    /**
     * Copies values for the specified field names into the data parameter.
     */
    getRecordValues(data?: Scriptable, from?: ㅤGlideRecord, names?: string): void;
    /**
     * Copies display values for the specified field names into the data parameter.
     */
    getRecordDisplayValues(data?: Scriptable, from?: ㅤGlideRecord, names?: string): void;
    /**
     * Get the fields of approval configurations for tables
     */
    getSpApprovalConfig(tableNames?: string): Scriptable;
    /**
     * Copies the element name, display value, and
     * value for the specified field names into the data parameter.
     */
    getRecordElements(from?: ㅤGlideRecord, names?: string): SPScriptObject;
    /**
     * Copies the element name, display value, and
     * value for the specified field names into the data parameter.
     */
    getRecordElements(data?: Scriptable, from?: ㅤGlideRecord, names?: string): void;
    /**
     * Get the specified widget instance. Used for including a widget inside
     * another widget (such as a menu inside header).
     */
    getWidgetScope(instanceID?: string): Scriptable;
    /**
     * Returns a widget from the specified widget instance.
     */
    getWidgetFromInstance(instanceID?: string): Scriptable;
    /**
     * Used for including a widget inside another widget without an instance.
     * Such as $sp.getWidget('widget_id', {p1: param1, p2?: param2});.
     */
    getWidget(widgetID?: string, widgetParams?: any): Scriptable;
    /**
     * Used for including a widget inside another widget without an instance.
     * Such as $sp.getWidget('widget_id', {p1: param1, p2?: param2});.
     */
    getWidget(widgetID?: string): Scriptable;
    /**
     * Get all data from 'tableName' where 'foreignKey' matches this widget
     * instance sys_id. Used by the carousel widget.
     */
    getRelatedList(tableName?: string, foreignKey?: string): NativeArray;
    /**
     * Returns the value of the specified parameter for the
     * Request or the Widget instance.
     */
    getParameter(name?: string): any;
    /**
     * Returns the GlideRecord for the current widget instance with no parameters or
     * the specified record with (table,sys_id) or (table,GlideElement).
     */
    getRecord(): ㅤGlideRecord;
    /**
     * Returns the table's variables as a string.
     */
    getVariables(): string;
    /**
     * Returns the table's variables as a string.
     */
    getVariables(includeNilResponses?: boolean): string;
    /**
     * Returns an array of objects where each object contains the
     * breadcrumb label, value, and flags for if fixed and if removed.
     */
    getFilterBreadcrumbs(table?: string, query?: string, fixedQuery?: string): SPScriptArray;
    /**
     * Returns the record's task variables.
     */
    getRecordVariables(gr?: ㅤGlideRecord): string;
    /**
     * Returns the record's task variables.
     */
    getRecordVariables(gr?: ㅤGlideRecord, includeNilResponses?: boolean): string;
    /**
     * Returns the table's variables as an object.
     */
    getVariablesArray(): Scriptable;
    /**
     * Returns the table's variables as an object.
     */
    getVariablesArray(includeNilResponses?: boolean): Scriptable;
    /**
     * Returns the record's variables.
     */
    getRecordVariablesArray(gr?: ㅤGlideRecord): Scriptable;
    /**
     * Returns the record's variables.
     */
    getRecordVariablesArray(gr?: ㅤGlideRecord, includeNilResponses?: boolean): Scriptable;
    /**
     * Get a record's activity stream as a JSON formatted list.
     * Typically for a task record.
     */
    getStreamEntries(): string;
    /**
     * Get the activity stream for the widget instance or the specified table or record.
     */
    getStream(): Scriptable;
    /**
     * Get the activity stream for the widget instance or the specified table or record.
     * Options: {fieldChange: boolean, email?: boolean}
     */
    getStream(table?: string, sys_id?: string, options?: Map<string, boolean>): Scriptable;
    /**
     * Get the activity stream for the widget instance or the specified table or record.
     */
    getStream(table?: string, sys_id?: string): Scriptable;
    /**
     * Returns the list of columns for the specified table and view.
     * Uses the mobile view when no view is specified.
     */
    getListColumns(tableName?: string): Scriptable;
    /**
     * Returns the list of columns for the specified table and view.
     * Uses the mobile view when no view is specified.
     */
    getListColumns(tableName?: string, view?: string): Scriptable;
    /**
     * Get the current user's initials.
     */
    getUserInitials(): string;
    /**
     * Get a simple object containing {label, value, display value, type}
     * from a GlideRecord by field name.
     */
    getField(gr?: ㅤGlideRecord, name?: string): Scriptable;
    /**
     * Like getField but returns an array of field objects for each comma separated field name.
     */
    getFields(gr?: ㅤGlideRecord, names?: string): Scriptable;
    /**
     * Like getField but returns a map of {fieldName: fieldObj, ...}
     * for each comma separated field name.
     */
    getFieldsObject(gr?: ㅤGlideRecord, names?: string): Scriptable;
    /**
     * Like getField but returns a map of {fieldName: fieldObj, ...}
     * for each comma separated field name.
     */
    getFieldsWithDotPathReferences(gr?: ㅤGlideRecord, names?: string): Scriptable;
    /**
     * Adds a record to the Service Portal statistics log.
     */
    static logStat(type?: string, table?: string, id?: string, text?: string): void;
    /**
     * Adds a record to the Service Portal statistics log.
     */
    static logStat(type?: string, table?: string, id?: string, text?: string, portalId?: string): void;
    /**
     * Adds a record to the Service Portal statistics log.
     */
    static logStat(type?: string, table?: string, id?: string): void;
    /**
     * Adds a record to the Service Portal statistics log.
     */
    static logSearch(table?: string, terms?: string, count?: number): void;
    /**
     * Adds a record to the Service Portal statistics log.
     */
    static logSearch(table?: string, terms?: string, count?: number, searchType?: string): void;
    /**
     * Adds a record to the Service Portal statistics log.
     */
    static logSearch(table?: string, terms?: string, count?: number, searchType?: string, portal?: string, page?: string): void;
    /**
     * Returns true if a record is valid and GlideRecord.canRead() returns true.
     * Accepts (table_name, sys_id) or (glideRecord).
     */
    canReadRecord(gr?: ㅤGlideRecord): boolean;
    /**
     * Returns true if a record is valid and GlideRecord.canRead() returns true.
     * Accepts (table_name, sys_id) or (glideRecord).
     */
    canReadRecord(table?: string, id?: string): boolean;
    /**
     * Get the fields and view definition of a sc_cat_item or
     * sc_cat_item_guide. Used to build a catalog item form.
     */
    getCatalogItem(itemID?: string): Scriptable;
    /**
     * Get the fields and view definition of a sc_cat_item or
     * sc_cat_item_guide. Used to build a catalog item form.
     */
    getCatalogItem(itemID?: string, isOrdering?: boolean, tableName?: string): Scriptable;
    /**
     * Get the fields and view definition of a sc_cat_item or
     * sc_cat_item_guide. Used to build a catalog item form.
     */
    getCatalogItem(itemID?: string, isOrdering?: boolean): Scriptable;
    /**
     * Get the fields and view definition of a sc_cat_item or
     * sc_cat_item_guide. Used to build a catalog item form.
     */
    getCatalogItem(data?: Scriptable): Scriptable;
    /**
     * Get the form and view from a table record, encoded query, and requested view.
     */
    getForm(table?: string, sys_id?: string): Scriptable;
    /**
     * Get the form and view from a table record, encoded query, and requested view.
     */
    getForm(table?: string, sys_id?: string, encodedQuery?: string): Scriptable;
    /**
     * Get the form and view from a table record, encoded query, and requested view.
     */
    getForm(table?: string, sys_id?: string, encodedQuery?: string, view?: string): Scriptable;
    /**
     * Get the form and view from a table record, encoded query, and requested view.
     */
    getForm(table?: string, sys_id?: string, encodedQuery?: string, view?: string, isPopup?: boolean): Scriptable;
    /**
     * Get the form and view from a table record, encoded query, and requested view.
     */
    getForm(table?: string, sys_id?: string, encodedQuery?: string, view?: string, isPopup?: boolean, includeScripts?: boolean): Scriptable;
    /**
     * Saves or updates the specified record.
     */
    saveRecord(table?: string, sys_id?: string, model?: Scriptable): Scriptable;
    /**
     * Returns KB articles in the specified category and its subcategories.
     * Pass 'limit' to limit the number of articles returned.
     */
    getKBCategoryArticles(category?: string, limit?: number): Scriptable;
    /**
     * Returns KB article summaries in the specified category and its subcategories. 'limit' is the max
     * number of articles to return. 'maxChars' is the max length of the article summary.
     */
    getKBCategoryArticleSummaries(category?: string, limit?: number, maxChars?: number): Scriptable;
    /**
     * Returns KB categories with the same parent as the specified category.
     */
    getKBSiblingCategories(catID?: string): ㅤGlideRecord;
    /**
     * Returns the number of Knowledge Base articles
     */
    getKBCount(kbIDs?: string): number;
    /**
     * Returns the KB subcategories of the specified category.
     */
    getSubCategories(catId?: string): ㅤGlideRecord;
    /**
     * Returns the top category in the hierarchy containing the specified category.
     */
    getKBTopCategoryID(catId?: string): string;
    /**
     * Returns portal's KB record where the workflow state is published.
     */
    getKBRecord(): ㅤGlideRecord;
    /**
     * Returns the portal's service catalog record where the class is not
     * a Content Item or Wizard Launcher and the state is active.
     */
    getSCRecord(): ㅤGlideRecord;
    /**
     * Removes non-breaking spaces from the specified string
     */
    stripHTML(html?: string): Scriptable;
    /**
     * Returns the menu items for the specified widget instance.
     */
    getMenuItems(sys_id?: string): Scriptable;
    /**
     * Builds the href portion of the URL (the value after ?id=)
     * for the specified page.
     */
    getMenuHREF(gr?: ㅤGlideRecord): Scriptable;
    /**
     * Sends the specified message to the console log.
     */
    log(message?: any): void;
    /**
     * Returns the widget instance's GlideRecord.
     */
    getInstanceRecord(): ㅤGlideRecord;
    constructor();
}
declare class GlideSystemUserSession {
    /**
     * Gets the sys_id of the current user
     */
    getUserID(): string;
    hasRoleInGroup(role?: any, group?: any): boolean;
    /**
     * Determines if the current user is currently logged in
     */
    isLoggedIn(): boolean;
    createUser(common_name?: string): string;
    /**
     * Gets the username, or User ID, of the current user (e.g., abel.tuter)
     */
    getUserName(): string;
    getSessionToken(): string;
    getImpersonatingUserName(): string;
    getImpersonatingUserID(): string;
    getImpersonatingUserDisplayName(): string;
    /**
     * Gets the display name of the current user (e.g., Abel Tuter, as opposed to abel.tuter)
     */
    getUserDisplayName(): string;
    userID(): string;
    user_id(): string;
    updateUserRoles(userSysId?: string): void;
    isScopeAdminForAnyApp(): boolean;
    /**
     * Returns a reference to the GlideUser object for the current user
     */
    getUser(): User;
    getUserNameByUserID(userID?: string): string;
    /**
     * Checks if the current session is interactive
     */
    isInteractive(): boolean;
    statsThisSession(onOff?: boolean): void;
    statsThisSessionThreshold(threshold?: number): void;
    user(): string;
    getTimeFormat(): string;
    getDateTimeFormat(): string;
    getDateFormat(): string;
    getSysTimeZone(): string;
    /**
     * Adds an error message for the current session
     */
    addErrorMessage(error?: any, messageKey?: string): void;
    addErrorMessageNoSanitization(error?: any, messageKey?: string): void;
    /**
     * Adds an info message for the current session
     */
    addInfoMessage(message?: any, messageKey?: string): void;
    addUniqueInfoMessage(message?: any, messageKey?: string): void;
    addInfoMessageNoSanitization(message?: any, messageKey?: string): void;
    addMessage(bucket?: string, message?: any, messageKey?: string): void;
    hasMessages(buckets?: any): boolean;
    flushMessages(): void;
    flushAccessMessages(): void;
    getMessages(type?: string): ArrayList;
    getInfoMessages(): ArrayList;
    getErrorMessages(): ArrayList;
    getTrivialMessages(): ArrayList;
    getAccessMessages(): ArrayList;
    getNavMessage(): any;
    getAuthMessages(): ArrayList;
    /**
     * Set the redirect URI for this transaction. This determines the next page the user will see
     */
    setRedirect(o?: any): void;
    setReturn(o?: any): void;
    /**
     * Gets the current URI for the session
     */
    getUrlOnStack(): string;
    /**
     * Gets the ID of current application, defined as a user preference and set by the application picker
     */
    getCurrentApplicationId(): string;
    setCurrentApplicationId(appId?: string): string;
    getCurrentApplicationScope(): string;
    getCurrentApplicationName(): string;
    isCurrentApplicationInGlobalScope(): boolean;
    isCurrentApplicationCustom(): boolean;
    isCurrentApplicationCrossScopeProtected(): boolean;
    suppressUpdateSynch(suppress?: boolean): boolean;
    suppressTextIndex(suppress?: boolean): boolean;
    setTrackMetadataDeletes(onOrOff?: boolean): boolean;
    isUpgradeDebuggerEnabled(): boolean;
    addUpgradeDebuggerArtifact(tableName?: string, sysId?: string): void;
    getUpgradeDebuggerResult(): UpgradeDebuggerResult;
    constructor();
}
declare namespace sn_atf {
    /**
     * Public scriptable API for ATF Performance Profiling
     */
    class PerformanceAPI {
        /**
         * Generates comparison data for the specified sys_atf_performance_compare; uses the "run1" and "run2" columns
         * to determine which sys_atf_performance_runs to compare. This is an asynchronous operation ...
         */
        static generateComparison(performanceID?: string): string;
        /**
         * Takes IDs of 2 sys_atf_performance_run record and determines if they can be compared. For 2 runs
         * to be compared they need to share at least 1 test in common.
         */
        static canCompare(performanceRunId1?: string, performanceRunId2?: string): boolean;
        /**
         * Takes the sys_id of a Performance Run (sys_atf_performance_run) record and returns true if
         * the given record is comparable to another Performance Run
         */
        static isComparable(sysId?: string): boolean;
        /**
         * returns a comma-separated string of the Performance Run statuses that are comparable
         */
        static getComparablePerformanceRunStatuses(): string;
        /**
         * Returns true if "ATF Test Generator and Cloud Runner" application (sn_atf_tg) is active and if the cloud runner user is configured
         * Returns false otherwise.
         */
        static isCloudRunnerActive(): boolean;
        /**
         * Returns true if "ATF Test Generator and Cloud Runner" application (sn_atf_tg) is active, cloud user configured and the
         * installed version supports ATF performance testing.
         */
        static isCloudRunnerActiveAndSupportsPerformance(): boolean;
        /**
         * Returns true if the given test has a performance comparable step
         */
        static doesTestHavePerformanceComparableStep(testId?: string): boolean;
        /**
         * Returns true if the given suite has a test with a performance comparable step
         */
        static doesSuiteHavePerformanceComparableStep(suiteId?: string): boolean;
    }
}
declare class GlideSystemUtilXML {
    getXMLText(xml?: string, xpath?: string): string;
    getXMLNodeList(xml?: string): ArrayList;
    getNodeValue(o?: any, i?: number): string;
    getNodeName(o?: any, i?: number): string;
    constructor();
}
/**
 * The scoped GlideDuration class provides methods for working with spans of time or durations. GlideDuration objects
 * store the duration as a date and time from January 1, 1970, 00?:00:00. As a result, ...
 */
declare class GlideDuration extends GlideTime {
    constructor();
    constructor(template?: GlideDuration);
    constructor(ms?: number);
    constructor(asDisplayed?: string);
    /**
     * Sets the display value
     */
    setDisplayValue(asDisplayed?: string): void;
    /**
     * Gets the duration value in d HH:mm:ss format
     */
    getDurationValue(): string;
    /**
     * Gets the display value of the duration in number of days, hours, and minutes
     */
    getDisplayValue(): string;
    /**
     * Sets the internal value of the GlideDuration object. Internally, GlideDuration is stored as DateTime
     */
    setValue(o?: any): void;
    subtract(value?: GlideDuration): GlideDuration;
    /**
     * Adds a given duration to the current duration
     */
    add(value?: GlideDuration): GlideDuration;
    /**
     * Gets the number of days
     */
    getDayPart(): number;
    /**
     * Gets the rounded number of days. If the time part is more than 12 hours, the return value is rounded up.
     * Otherwise, it is rounded down
     */
    getRoundedDayPart(): number;
    isShowTimerAlert(): boolean;
}
/**
 * The scoped GlideAggregate class is an extension of GlideRecord and allows database aggregation (COUNT, SUM, MIN, MAX,
 * AVG) queries to be done. This can be helpful in creating customized reports or i...
 */
declare interface GlideAggregateGenerated extends ㅤGlideRecord {
    enableSecurityFeature(feature?: string): void;
    disableSecurityFeature(feature?: string): void;
    /**
     * Adds an aggregate
     */
    addAggregate(agg?: string, name?: string): void;
    addTrend(fieldName?: string, timeInterval?: string, numUnits?: number): void;
    addBizCalendarTrend(fieldName?: string, bizCalendarSysId?: string): void;
    addBizCalendarTrendBase(fieldName?: string, bizCalendarSysId?: string): void;
    addBizCalendarTrendIntersect(anotherCalendarSysId?: string, overlapMode?: string): void;
    addHaving(arg1?: string, arg2?: string, arg3?: string, arg4?: string): void;
    /**
     * Adds a query to the aggregate. Adds an encoded query to the other queries that may have been set for this aggregate
     */
    addEncodedQuery(query?: string, enforceFieldACLs?: any): void;
    /**
     * Provides the name of a field to use in grouping the aggregates. May be called numerous times to set multiple
     * group fields
     */
    groupBy(name?: string): void;
    /**
     * Sorts the aggregates based on the specified aggregate and field
     */
    orderByAggregate(agg?: string, name?: string): void;
    /**
     * Orders the aggregates using the value of the specified field. The field will also be added to the group-by list
     */
    orderBy(name?: string): void;
    /**
     * Sorts the aggregates into descending order based on the specified field
     */
    orderByDesc(name?: string): void;
    /**
     * Sets whether the results are to be grouped
     */
    setGroup(b?: boolean): void;
    setGroupByFollowRef(b?: boolean): void;
    setOrderByFollowRef(b?: boolean): void;
    setOrder(b?: boolean): void;
    setIntervalYearIncluded(b?: boolean): void;
    setAggregateWindow(firstRowWanted?: number, lastRowWanted?: number): void;
    getTotal(agg?: string, name?: string): number;
    getCount(): number;
    /**
     * Gets the value of the specified aggregate
     */
    getAggregate(agg?: string, name?: string): string;
    getQuery(): string;
    /**
     * Gets the query necessary to return the current aggregate
     */
    getAggregateEncodedQuery(): string;
    /**
     * Gets the value of a field
     */
    getValue(name?: string): string;
    isBizCalendarTrendFillGap(): boolean;
    setBizCalendarTrendFillGap(b?: boolean): void;
}
declare class GlideNativeRecordMutex {
    constructor(cs?: Context, args?: any[], ctorObj?: Function, inNew?: boolean);
    /**
     * Wait until this mutex is unlocked, then lock it and return true; or return false on any error (such as
     * the mutex record not being found, or the max spins being reached (see setMaxSpins())). Note tha...
     */
    get(): boolean;
    /**
     * Release this mutex lock.
     */
    release(): void;
    /**
     * Invoke on a mutex already held by this thread. Extends this thread's ownership period, resetting the
     * idle expiration (which is 1 minute after get() by default).
     */
    touch(): void;
    /**
     * Sets the expiration for this lock, in milliseconds. This expiration period is collaborative; it is assumed
     * that all users of the mutex set the same expiration. By default, the lock expires (becomes ...
     */
    setMutexExpires(expires?: number): void;
    /**
     * Sets the maximum number of times to "spin" -- poll the database and sleep -- while waiting for the lock
     * to become available. The spin wait is configured by a system property (for all mutex types) an...
     */
    setMaxSpins(maxSpins?: number): void;
}
declare class GlidePreciseTime extends GlideDateTime {
    constructor();
    constructor(value?: string);
    constructor(g?: GlideDateTime);
    setValue(o?: any): void;
    getDisplayValue(): string;
    getDisplayValueInternal(): string;
    getDisplayValueWithoutTZ(): string;
    setDisplayValue(value?: string): void;
    setDisplayValue(value?: string, format?: string): void;
    setDisplayValueInternal(value?: string): void;
}
/** Error types which can be set as the response body of a Scripted REST API */
declare namespace sn_ws_err { /** Sets status code 404 and includes the specified message in the response */
    function NotFoundError(message?: string): void;
    /** Sets status code 409 and includes the specified message in the response */
    function ConflictError(message?: string): void;
    /** Sets status code 415 and includes the specified message in the response */
    function UnsupportedMediaTypeError(message?: string): void;
    /** Sets status code 406 and includes the specified message in the response */
    function NotAcceptableError(message?: string): void;
    /** Sets status code 400 and includes the specified message in the response */
    function BadRequestError(message?: string): void;
    /** A generic error message wrapper to set status code and detailed error message in the response */
    class ServiceError {
        /** The response status code -- defaults to 500 */
        setStatus(code?: number): void;
        /** The error message */
        setMessage(message?: string): void;
        /** The detailed error message */
        setDetail(detail?: string): void;
        constructor();
    }
}
/**
 * The Scoped GlideSysAttachment API provides a way to handle attachments
 */
declare class GlideSysAttachment {
    constructor();
    /**
     * Returns the attachment content as a string
     */
    getContent(sysAttachment?: ㅤGlideRecord): string;
    /**
     * Returns the attachment content as a string with base64 encoding
     */
    getContentBase64(sysAttachment?: ㅤGlideRecord): string;
    /**
     * Attaches a specified attachment to the specified record. Returns attachment sys_id or null if the attachment was not added
     */
    write(gr?: ㅤGlideRecord, fileName?: string, contentType?: string, content?: string): string;
    /**
     * Inserts an attachment for the specified record using base64 encoded content. Returns sys_id of the attachment created
     */
    writeBase64(gr?: ㅤGlideRecord, fileName?: string, contentType?: string, contentBase64?: string): string;
    /**
     * Inserts an attachment using the input stream. Returns sys_id of the attachment created
     */
    writeContentStream(gr?: ㅤGlideRecord, fileName?: string, contentType?: string, is?: GlideScriptableInputStream): string;
    /**
     * Deletes the specified attachment
     */
    deleteAttachment(sysAttachmentID?: string): void;
    /**
     * Copies attachments from the source record to the target record. Returns array of sys_ids of the attachments that were copied
     */
    copy(sourceTable?: string, sourceID?: string, targetTable?: string, targetID?: string): ArrayList<string>;
    /**
     * Copies attachments from the source record to the target record. Returns array of sys_ids of the attachments that were copied
     */
    static copy(sourceTable?: string, sourceID?: string, targetTable?: string, targetID?: string): ArrayList<string>;
    /**
     * Returns a GlideRecord containing the matching attachment metadata such as name, type, or size
     */
    getAttachments(tableName?: string, sys_id?: string): ㅤGlideRecord;
    /**
     * Returns a GlideScriptableInputStream object given the sys_id of an attachment
     */
    getContentStream(sysAttachmentID?: string): GlideScriptableInputStream;
}
/** The scoped GlideSystem (referred to by the variable name 'gs' in any server-side JavaScript) API provides a number of convenient methods to get information about the system, the current logged in user, etc. */
declare interface gs {
    /** Returns a reference to the GlideUser object for the current user */
    getUser(): GlideUser;
    /** Gets a reference to the current Glide session */
    getSession(): GlideSession;
    /** Queues an event for the event manager */
    eventQueue(name?: string, record?: GlideRecord, parm1?: string, parm2?: string, queue?: string): void;
    /** Retrieves a message from UI messages */
    getProperty(key?: string, alt?: Object): string;
    /**  */
    urlDecode(url?: string): string;
    /**  */
    urlEncode(url?: string): string;
    /**  */
    base64Decode(s?: string): string;
    /**  */
    base64Encode(s?: string): string;
    /**  */
    xmlToJSON(xmlString?: string): Object;
    /** Gets the name of the current scope */
    getCurrentScopeName(): string;
    /** Gets the caller scope name, or returns null if there is no caller */
    getCallerScopeName(): string;
    /** Queries an object and returns true if the object is null, undefined, or contains an empty string */
    nil(o?: Object): boolean;
    /** Retrieves a message from UI messages. args is an optional paramter */
    getMessage(id?: string, args?: any): string;
    /** Determines if the current user has the specified role */
    hasRole(role?: string): boolean;
    /** Provides a safe way to call from the sandbox, allowing only trusted scripts to be included */
    include(name?: string): boolean;
    /** Gets the GlideSession Session ID */
    getSessionID(): string;
    /** Determines if a database table exists */
    tableExists(name?: string): boolean;
    /** Gets a string representing the cache version for a CSS file */
    getCssCacheVersionString(): string;
    /** Generates a GUID that can be used when a unique identifier is required */
    generateGUID(obj?: Object): string;
    /**  */
    getNewAppScopeCompanyPrefix(): string;
    /**  */
    getMaxSchemaNameLength(): number;
    /** Adds an error message for the current session */
    addErrorMessage(message?: string): void;
    /** Adds an info message for the current session */
    addInfoMessage(message?: string): void;
    /** Gets the display name of the current user (e.g., Abel Tuter, as opposed to abel.tuter) */
    getUserDisplayName(): string;
    /** Gets the sys_id of the current user */
    getUserID(): string;
    /** Gets the username, or User ID, of the current user (e.g., abel.tuter) */
    getUserName(): string;
    /** Set the redirect URI for this transaction. This determines the next page the user will see */
    setRedirect(url?: string): void;
    /** Checks if the current session is interactive */
    isInteractive(): boolean;
    /** Determines if the current user is currently logged in */
    isLoggedIn(): boolean;
    /** Gets the current URI for the session */
    getUrlOnStack(): string;
    /** Gets the ID of current application, defined as a user preference and set by the application picker */
    getCurrentApplicationId(): string;
    /** Returns (UTC) 24 hours ago adjusted for the timezone of the current session */
    yesterday(): string;
    /** Returns the (UTC) start of the day that was the specified number of days ago adjusted for the timezone of the server */
    daysAgo(days?: number): string;
    /** Returns the (UTC) start of the day that was the specified number of days ago adjusted for the timezone of the server */
    daysAgoStart(daysAgo?: number): string;
    /** Returns the (UTC) end of the day that was the specified number of days ago adjusted for the timezone of the server */
    daysAgoEnd(daysAgo?: number): string;
    /** Returns the (UTC) beginning of the specified week adjusted for the timezone of the current session */
    beginningOfWeek(o?: Object): string;
    /** Returns the (UTC) end of the specified week adjusted for the timezone of the current session */
    endOfWeek(o?: Object): string;
    /** Returns the (UTC) end of next week adjusted for the timezone of the server */
    endOfNextWeek(): string;
    /** Gets the date and time for the beginning of next week in UTC, adjusted for the timezone of the server */
    beginningOfNextWeek(): string;
    /** Returns the (UTC) end of last week adjusted for the timezone of the server */
    endOfLastWeek(): string;
    /** Gets the date and time for the beginning of last week in UTC, adjusted for the timezone of the server */
    beginningOfLastWeek(): string;
    /** Gets the date and time for the beginning of this week in UTC, adjusted for the timezone of the server */
    beginningOfThisWeek(): string;
    /** Gets the date and time for the end of this week in UTC, adjusted for the timezone of the server */
    endOfThisWeek(): string;
    /** Gets the date and time for the beginning of this month in UTC, adjusted for the timezone of the server */
    beginningOfThisMonth(): string;
    /** Gets the date and time for the end of this month in UTC, adjusted for the timezone of the server */
    endOfThisMonth(): string;
    /** Gets the date and time for the beginning of next month in UTC, adjusted for the timezone of the server */
    beginningOfNextMonth(): string;
    /** Gets the date and time for the end of next month in UTC, adjusted for the timezone of the server */
    endOfNextMonth(): string;
    /** Gets the date and time for the beginning of last month in UTC, adjusted for the timezone of the server */
    beginningOfLastMonth(): string;
    /** Gets the date and time for the end of last month in UTC, adjusted for the timezone of the server */
    endOfLastMonth(): string;
    /** Returns the (UTC) start of the quarter that was the specified number of months ago adjusted for the timezone of the server */
    monthsAgo(month?: number): string;
    /** Returns the (UTC) start of the quarter that was the specified number of months ago adjusted for the timezone of the server */
    monthsAgoStart(month?: number): string;
    /** Gets the date and time for the beginning of this quarter in UTC, adjusted for the timezone of the server */
    beginningOfThisQuarter(): string;
    /** Gets the date and time for the end of this quarter in UTC, adjusted for the timezone of the server */
    endOfThisQuarter(): string;
    /** Returns the (UTC) start of the quarter that was the specified number of quarters ago adjusted for the timezone of the server */
    quartersAgoStart(quarters?: number): string;
    /** Returns the (UTC) end of the quarter that was the specified number of quarters ago adjusted for the timezone of the server */
    quartersAgoEnd(quarters?: number): string;
    /** Gets the date and time for the beginning of this year in UTC, adjusted for the timezone of the server */
    beginningOfThisYear(): string;
    /** Gets the date and time for the end of this year in UTC, adjusted for the timezone of the server */
    endOfThisYear(): string;
    /** Gets the date and time for the beginning of last year in UTC, adjusted for the timezone of the server */
    beginningOfLastYear(): string;
    /** Gets the date and time for the end of last year in UTC, adjusted for the timezone of the server */
    endOfLastYear(): string;
    /** Gets the date and time for the beginning of next year in UTC, adjusted for the timezone of the server */
    beginningOfNextYear(): string;
    /** Gets the date and time for the end of next year in UTC, adjusted for the timezone of the server */
    endOfNextYear(): string;
    /** Returns the (UTC) start of the hour that was the specified number of hours ago adjusted for the timezone of the server */
    hoursAgoStart(hours?: number): string;
    /** Returns the (UTC) end of the hour that was the specified number of hours ago adjusted for the timezone of the server */
    hoursAgoEnd(hours?: number): string;
    /** number of hours ago */
    hoursAgo(hours?: number): string;
    /** number of minutes ago */
    minutesAgo(minutes?: number): string;
    /** Returns the (UTC) start of the minute that was the specified number of minutes ago adjusted for the timezone of the serve */
    minutesAgoStart(minutes?: number): string;
    /** Returns the (UTC) end of the minute that was the specified number of minutes ago adjusted for the timezone of the serve */
    minutesAgoEnd(minutes?: number): string;
    /** Returns the date of the duration time after January 1 */
    getDurationDate(duration?: string): string;
    /** Returns a String of the form :interval,value,operator */
    datePart(interval?: string, value?: string, operator?: string): string;
    /** Uses the error level to log a message to the system log */
    error(message?: string, parm1?: Object, parm2?: Object, parm3?: Object, parm4?: Object, parm5?: Object): void;
    /** Uses the warn level to log a message to the system log */
    warn(message?: string, parm1?: Object, parm2?: Object, parm3?: Object, parm4?: Object, parm5?: Object): void;
    /** Uses the info level to log a message to the system log */
    info(message?: string, parm1?: Object, parm2?: Object, parm3?: Object, parm4?: Object, parm5?: Object): void;
    /** Uses the debug level to log a message to the system log */
    debug(message?: string, parm1?: Object, parm2?: Object, parm3?: Object, parm4?: Object, parm5?: Object): void;
    /** Determines if debugging is active for a specific scope */
    isDebugging(): boolean;
    /** Determines if the UI is running as mobile */
    isMobile(): boolean;
}
declare const gs: gs;
/**
 * The scoped GlideFilter class allows you to determine if a record meets a specified set of requirements. There is no
 * constructor for scoped GlideFilter, it is accessed by using the global object 'Gli...
 */
declare class GlideFilter {
    constructor(filter?: string, title?: string);
    getFilter(): string;
    match(gr?: ㅤGlideRecord, bMatchAll?: boolean): boolean;
    getScript(filterString?: string, targetTableName?: string): string;
    getTitle(): string;
    getDisplayTitle(): string;
    setDisplayTitle(title?: string): void;
    setEnforceSecurity(enforceSecurity?: boolean): void;
    /**
     * Returns true when the record meets the filter condition
     */
    static checkRecord(gr?: ㅤGlideRecord, filter?: string): boolean;
    /**
     * Returns true when the record meets the filter condition
     */
    static checkRecord(gr?: ㅤGlideRecord, filter?: string, match?: boolean): boolean;
    setCaseSensitive(caseSensitive?: boolean): void;
}
/** Scripted Screen */
declare namespace sn_scripted_screen {
    /** Scripted Input Form Screen Builder */
    class ParameterScreenBuilder {
        fetchType: string;
        nextLabel: string;
        previousLabel: string;
        cancelLabel: string;
        submitLabel: string;
        paginationType: string;
        resume: boolean;
        advancedPagination: boolean;
        presentationStyle: string;
        trackInputUpdateTimestamps: string;
        /** Add Input to scripted screen */
        addInput(input?: InputBuilder): void;
        /** Add Page to scripted screen */
        addPage(page?: PageBuilder): void;
        /** Add Variable to scripted screen */
        addVariable(variable?: VariableBuilder): void;
        /** Add Section to scripted screen */
        addSection(page?: PageBuilder, section?: SectionBuilder): void;
        /** Set Unsaved Changes Confirmation Dialog builder */
        setUnsavedChangesConfirmationDialog(dialogBuilder?: UnsavedChangesConfirmationDialogBuilder): void;
        /** Add Button Instance builder */
        addButtonInstance(buttonInstanceBuilder?: object): void;
        /** Create scripted screen*/
        constructor(id?: string, name?: string);
    }
    /** Scripted Button Instance builder */
    class ButtonInstanceBuilder {
        icon: string;
        order: number;
        /** Create Button Instance builder */
        constructor();
    }
    /** Scripted Input builder */
    class InputBuilder {
        description: string;
        placeHolder: string;
        readOnly: boolean;
        mandatory: boolean;
        order: number;
        /** Add DescriptiveElement to scripted input */
        addDescriptiveElement(descElement?: DescriptiveElementBuilder): void;
        /** Add Attribute to scripted input */
        addAttribute(name?: string, value?: object): void;
        /** Add Choice to scripted input */
        addChoice(choice?: ChoiceBuilder): void;
        /** Set Autofill Variable to scripted input */
        autofillVariable(variable?: VariableBuilder): void;
        /** Set Page to scripted input */
        setPage(page?: PageBuilder): void;
        /** Set Section to scripted input */
        setSection(section?: SectionBuilder): void;
        /** Add Action to scripted input */
        addAction(action?: ParameterActionBuilder): void;
        /** Create scripted input*/
        constructor(name?: string, type?: string, label?: string);
    }
    /** Scripted PageBuilder builder*/
    class PageBuilder {
        order: number;
        title: string;
        /** Create script page */
        constructor(name?: string);
    }
    /** Scripted VariableBuilder builder*/
    class VariableBuilder {
        /** Add Attribute to scripted variable */
        addAttribute(name?: string, value?: object): void;
        constructor(name?: string, type?: string);
    }
    /** Scripted SectionBuilder builder*/
    class SectionBuilder {
        name: string;
        label: string;
        description: string;
        order: number;
        /** Add DescriptiveElement to scripted section */
        addDescriptiveElement(descElement?: string): void;
        /** Create scripted section */
        constructor(name?: string);
        /** Add attribute to scripted section */
        addAttribute(name?: string, value?: object): void;
    }
    /** Scripted DescriptiveElement builder */
    class DescriptiveElementBuilder {
        label: string;
        order: number;
        /** Add attribute to scripted DescriptiveElement */
        addAttribute(name?: string, value?: object): void;
        /** Set autofill variable to scripted DescriptiveElement */
        autofillVariable(variable?: VariableBuilder): void;
        /** Create DescriptiveElement */
        constructor(descElementName?: string, descElementType?: string);
    }
    /** Scripted Parameter Action builder */
    class ParameterActionBuilder {
        /** Set as comment Scripted action */
        forComment(): ParameterActionBuilder;
        /** Set as attachment Scripted action */
        forAttachment(hiddenAttachmentSources?: string): ParameterActionBuilder;
        /** Set as navigation Scripted action */
        forButton(buttonId?: string): ParameterActionBuilder;
        /** Set icon to scripted Parameter action */
        setIconId(iconId?: String): ParameterActionBuilder;
        /** Set DataSource attributes */
        setDataSourceAttributes(dataSourceId?: string, elementIdentifier?: string): ParameterActionBuilder;
        /** Create scripted ParameterAction */
        constructor(name?: string, label?: string);
    }
    /** Scripted Unsaved Changes Confirmation Dialog builder */
    class UnsavedChangesConfirmationDialogBuilder {
        title: string;
        body: string;
        confirmButtonLabel: string;
        cancelButtonLabel: string;
        constructor();
    }
    /** Scripted Choice builder*/
    class ChoiceBuilder {
        value: string;
        imageUrl: string;
        selectedImageUrl: string;
        order: number;
        /** Create scripted choice */
        constructor(label?: string);
    }
}
/**
 * The scoped GlideDate class provides methods for performing operations on GlideDate objects, such as instantiating
 * GlideDate objects or working with GlideDate fields
 */
declare class GlideDate extends GlideDateTime {
    constructor();
    constructor(date?: Date);
    constructor(date?: GlideDate);
    constructor(value?: string);
    constructor(value?: string, isDisplayValue?: boolean);
    /**
     * Sets the date of the GlideDate object
     */
    setValue(o?: any): void;
    /**
     * Sets a date value using the current user's display format and time zone
     */
    setDisplayValue(asDisplayed?: string): void;
    /**
     * Gets the date in the current user's display format and time zone
     */
    setDisplayValueLang(asDisplayed?: string, style?: string): void;
    setDisplayValueLang(asDisplayed?: string, style?: string, language?: string): void;
    getDisplayValue(): string;
    getDisplayValueLang(style?: string): string;
    getDisplayValueLang(style?: string, language?: string): string;
    /**
     * Gets the display value in the internal format (yyyy-MM-dd). Note: This method is useful for date or time fields,
     * but not date fields
     */
    getDisplayValueInternal(): string;
    /**
     * Gets the date in the given date format
     */
    getByFormat(format?: string): string;
    /**
     * Returns the day part of a date with no timezone conversion
     */
    getDayOfMonthNoTZ(): number;
    /**
     * Returns the month part of a date with no timezone conversion
     */
    getMonthNoTZ(): number;
    /**
     * Returns the year part of a date with no timezone conversion
     */
    getYearNoTZ(): number;
    static parseDate(date?: string, language?: string, country?: string): GlideDate;
}
/**
 * Handles printing from the mail script to the email message
 */
declare class ScopedTemplatePrinter extends WrappedScriptableObject {
    /**
     * Outputs message to the email body
     */
    print(string?: string): void;
    /**
     * Outputs spaces to the email body
     */
    space(spaces?: number): void;
}
/** These objects are relevant to Scripted REST APIs and are accessed via the request or response input parameters to Scripted APIs */
declare namespace sn_ws_int { /** Allows you to access request details in Scripted REST APIs */
    class RESTAPIRequest {
        /** The body of the request */
        body: sn_ws_int.RESTAPIRequestBody;
        /** The query parameters from the request as an object */
        queryParams;
        /** The variable path parameters passed in the request URI as an object */
        pathParams;
        /** All headers from the request */
        headers;
        /** Get the value of a specific header from the request */
        getHeader(headerName?: string): string;
        /** The entire request URL, including domain */
        urlstring;
        /** The request URI, excluding domain information */
        uristring;
        /** The entire query string from the request URI */
        queryStringstring;
        /** Obtain a set of media types that are common between what the client request accepts and what this service is able to produce */
        getSupportedResponseContentTypes(): Object;
        /** Get the query category (i.e. read replica category) from query parameter 'sysparm_query_category' */
        getRequestedQueryCategory(): string;
        constructor();
    }
    /** Allows you to access the request body as a stream, as a string, de-serialized into an object, or as an array of obects */
    class RESTAPIRequestBody {
        /** The body of the request as a stream. Note, this object provides no functions to manipulate the stream from script. Rather this object can be passed to another API which takes an InputStream as an input parameter */
        dataStreamGlideScriptableInputStream;
        /** The request body as a string -- be careful to consider impact to memory */
        dataStringstring;
        /** The request body de-serialized as an object */
        data;
        /** Returns the next entry from the request body as an object if request is array. If not an array then returns entire request body as an object */
        nextEntry(): Object;
        /** Return true if request has more entries. Use this in conjunction with nextEntry */
        hasNext(): boolean;
        constructor();
    }
    /** Allows you to configure the HTTP response in Scripted REST APIs */
    class RESTAPIResponse {
        /** Set response HTTP status code */
        setStatus(code?: number): void;
        /** Set response headers from the specified object */
        setHeaders(headers?: any): void;
        /** Set a response header */
        setHeader(name?: string, value?: string): void;
        /** Set the Location header */
        setLocation(locationValue?: string): void;
        /** Set the Content-Type header */
        setContentType(contentType?: string): void;
        /** Set Response Error */
        setError(error?: any): void;
        /** Use the specified object as the response body */
        setBody(body?: any): void;
        /** Return stream writer. Caller responsible to set proper content type and status using setStatus and setHeader methods. Caller responsible to populate all headers on response before actually writing to stream */
        getStreamWriter(): sn_ws_int.RESTAPIResponseStream;
        constructor();
    }
    /** Allows you to write streams or strings directly to the response stream in a Scripted REST API */
    class RESTAPIResponseStream {
        /** Write a string directly to the response stream. Can be called multiple times. Caller responsible for response format and setting proper Content-Type and status code prior to calling */
        writeString(stringToWrite?: string): void;
        /** Write an InputStream directly to the response stream. Can be called multiple times. Caller responsible for response format and setting proper Content-Type and status code prior to calling */
        writeStream(inputStream?: Object): void;
        constructor();
    }
    /** Provides access to request input parameters */
    class WSRequest {
        /** Use request.<parameter name> to get the value of an input parameter */
        _input_parameter_name_;
        constructor();
    }
    /** Allows setting response output parameters */
    class WSResponse {
        /** Use response.<parameter name> to assign a value to an output parameter */
        _output_parameter_name_;
        /** Use this variable to assign a response value as a DOM Element */
        soapResponseElement;
        constructor();
    }
    /** SOAP request object as a String */
    const WSSoapRequestXML: string;
    /** SOAP request object as a DOM Document or XMLDocument2 (for new application scope) */
    const WSSoapRequestDocument: Object;
}
/** MetricBase JavaScript API */
declare namespace sn_clotho { /** Instantiates a MetricBase transformer for the specified GlideRecord */
    class Transformer {
        /** Groups the subject records by the specified field */
        groupBy(field?: string): sn_clotho.TransformPart;
        /** Specifies the metric field that this transformer operates on */
        metric(metricName?: string): sn_clotho.TransformPart;
        /** Executes the transforms defined by this transformer over the specified time range and returns an object containing the results */
        execute(rangeStart?: GlideDateTime, rangeEnd?: GlideDateTime): sn_clotho.TransformResult;
        constructor(gr?: GlideRecord);
    }
    /** Defines a transformer's transforms */
    class TransformPart {
        /** Groups the subject records by the specified field */
        groupBy(field?: string): sn_clotho.TransformPart;
        /** Specifies the metric field that this transformer operates on */
        metric(metricName?: string): sn_clotho.TransformPart;
        /** Includes this intermediate transform as part of the result */
        collect(): sn_clotho.TransformPart;
        /** Produces a new series where each value is the average of all of the values at each timestamp */
        avg(): sn_clotho.TransformPart;
        /** Produces a new series where each value is the sum of all of the values at each timestamp */
        sum(): sn_clotho.TransformPart;
        /** Labels this series */
        label(label?: string): sn_clotho.TransformPart;
        /** Produces a new series that counts the number of series with values in the input */
        count(): sn_clotho.TransformPart;
        /** Adds the specified constant quantity to all values */
        add(summand?: number): sn_clotho.TransformPart;
        /** Subtracts the specified constant quantity from all values */
        sub(substrahend?: number): sn_clotho.TransformPart;
        /** Multiplies all values by the specified constant quantity */
        mul(factor?: number): sn_clotho.TransformPart;
        /** Divides all values by the specified constant quantity */
        div(divisor?: number): sn_clotho.TransformPart;
        /** Performs a logarithm on all values with the specified constant base */
        log(base?: number): sn_clotho.TransformPart;
        /** Aligns all series to have the specified number of data points */
        resample(numValues?: number): sn_clotho.TransformPart;
        /** Produces a set of new series by specified condition */
        where(condition?: Condition): sn_clotho.TransformPart;
        /** Populates missing (NaN) values with two-point linear regression using the specified tolerance for maximum range of missing data */
        interpolate(countOrDuration?: object): sn_clotho.TransformPart;
        /** Produces a set of series with the top 'count' (specified) largest values at each timestamp */
        top(count?: number): sn_clotho.TransformPart;
        /** Produces a set of series with the bottom 'count' (specified) smallest values at each timestamp */
        bottom(count?: number): sn_clotho.TransformPart;
        /** Produces a new series with the smallest values at each timestamp */
        min(): sn_clotho.TransformPart;
        /** Produces a new series with the largest values at each timestamp */
        max(): sn_clotho.TransformPart;
        /** Produces a new series with the standard deviation of the values at each timestamp */
        stddev(): sn_clotho.TransformPart;
        /** Produces a new series with the median of the values at each timestamp */
        median(): sn_clotho.TransformPart;
        /** Produces a new series with the values filtered (AVG, MAX, MIN or LAST) by sliding windows */
        filter(_aggregator?: string, _window?: string): sn_clotho.TransformPart;
        /** Fits the series to the specified model using the specified parameters */
        fit(_params?: object): sn_clotho.TransformPart;
        /** Produces a new series with the values filtered (AVG, MAX, MIN or LAST) by non-overlapping windows */
        partition(_aggregator?: string, _window?: string, _base?: string): sn_clotho.TransformPart;
        /** Produces a set of series where each is one of the specified percentiles of all of the data */
        fractiles(fractions?: [
            number
        ]): sn_clotho.TransformPart;
        /** Rounds all values to the specified precision */
        round(precision?: number): sn_clotho.TransformPart;
        /** Ceils all values to the specified precision */
        ceil(precision?: number): sn_clotho.TransformPart;
        /** Floors all values to the specified precision */
        floor(precision?: number): sn_clotho.TransformPart;
        /** Limits the number of data points in each series to the specified count */
        limit(count?: number): sn_clotho.TransformPart;
        constructor();
    }
    /** An object that contains a transform execution result */
    class TransformResult {
        /** Returns a series with the specified label */
        getByLabel(label?: string): sn_clotho.Data;
        /** Returns the all series of this TransformResult in the form of an array */
        toArray(): [
            sn_clotho.Data
        ];
        /** Returns this result's series, assuming that there is a single resultant series */
        getData(): sn_clotho.Data;
        /** Returns a mapping of group names to their series */
        byGroup(): map;
        constructor();
    }
    /** Stores a single series of MetricBase data */
    class Data {
        /** Returns the label of this series */
        getLabel(): string;
        /** Returns the name of the metric this series operates on */
        getMetricName(): string;
        /** Returns the name of the table this series operates on */
        getTableName(): string;
        /** Returns the value of the subject this series operates on */
        getSubject(): string;
        /** Returns the start time of this series */
        getStart(): GlideDateTime;
        /** Returns the end time of this series */
        getEnd(): GlideDateTime;
        /** Returns the period of this series */
        getPeriod(): number;
        /** Returns the number of values in this series */
        size(): number;
        /** Returns the values in this series in the form of an array of numbers */
        getValues(): [
            number
        ];
        /** Converts this series into a model string */
        toModelString(): string;
        /** Converts the specified model string into a series */
        fromModelString(model?: string): sn_clotho.Data;
        constructor();
    }
    /** Interacts with the MetricBase database */
    class Client {
        /** Uses the specified DataBuilder to put data into MetricBase */
        put(dataBuilder?: sn_clotho.DataBuilder): void;
        /** Performs the specified transform(s) over the specified range */
        transform(o1?: object, o2?: GlideDateTime, o3?: GlideDateTime): object;
        constructor();
    }
    /** Builds data to put into MetricBase */
    class DataBuilder {
        /** Adds the specified value to the data at the specified time */
        add(start?: GlideDateTime, value?: number): sn_clotho.DataBuilder;
        constructor(cx?: Context, args?: [
            object
        ], ctorObj?: Function, inNewExpr?: boolean);
    }
}
/**
 * GlideLocale is a global object that can be called in scripts. Use the get() method to get a GlideLocale object
 */
declare class GlideLocale {
    /**
     * Returns the GlideLocale object
     */
    static get(): GlideLocale;
    getCurrent(): Locale;
    getCurrencyCode(): string;
    getNumericCurrencyCode(): string;
    /**
     * Returns the decimal separator
     */
    getDecimalSeparator(): string;
    /**
     * Returns the grouping separator
     */
    getGroupingSeparator(): string;
    getSystemLocale(): Locale;
    constructor();
}
declare class XMLNodeIterator {
    constructor();
    /**
     * Determines if the iteration has more elements
     */
    hasNext(): boolean;
    /**
     * Gets the next element in the iteration
     */
    next(): any;
}
declare interface Number extends GlideElement, number {
}
declare interface Boolean extends GlideElement, boolean {
}
declare interface String extends GlideElement, string {
}
declare interface Any extends GlideElement, any {
}
declare interface ㅤGlideElement<T extends keyof Tables> extends GlideElement {
    getValue<N extends keyof Tables[T], V extends Tables[T][N]>(fieldName?: N): V;
    setValue<N extends keyof Tables[T], V extends Tables[T][N]>(fieldName?: N, value?: V): void;
}
declare interface ㅤGlideRecord<T extends keyof Tables> extends GlideRecordGenerated {
    constructor(table?: T);
    addQuery<N extends keyof Tables[T], V extends Tables[T][N]>(name?: N, value?: V): GlideQueryCondition<T>;
    addQuery<N extends keyof Tables[T], V extends Tables[T][N]>(name?: N, operator?: any, value?: V): GlideQueryCondition<T>;
    addNullQuery<N extends keyof Tables[T]>(fieldName?: N);
    addNotNullQuery<N extends keyof Tables[T]>(fieldName?: N): GlideQueryCondition<T>;
    setValue<N extends keyof Tables[T], V extends Tables[T][N]>(fieldName?: N, value?: V): void;
    getValue<N extends keyof Tables[T], V extends Tables[T][N]>(fieldName?: N): V;
    isValidField<N extends keyof Tables[T]>(fieldName?: N);
    getDisplayValue<N extends keyof Tables[T]>(fieldName?: N): string;
    orderBy<N extends keyof Tables[T]>(fieldName?: N): void;
    orderByDesc<N extends keyof Tables[T]>(fieldName?: N): void;
    addJoinQuery<JT extends keyof Tables, N extends keyof Tables[T], JF extends keyof Tables[JT]>(joinTable?: JT, primaryField?: N, joinTableField?: JF): GlideQueryCondition<T>;
    getElement<N extends keyof Tables[T]>(fieldName?: N): GlideElement;
}
declare interface GlideRecordㅤ {
    new <T extends keyof Tables>(table?: T): ㅤGlideRecord<T> & Tables[T];
}
declare const GlideRecord: GlideRecordㅤ = ㅤGlideRecord;
declare interface ㅤGlideAggregate<T extends keyof Tables> extends GlideRecordGenerated {
    addAggregate<N extends keyof Tables[T]>(aggregate?: string, field?: N): void;
    getAggregate<N extends keyof Tables[T]>(aggregate?: string, field?: N): string;
    addTrend<N extends keyof Tables[T]>(fieldName?: N, timeInterval?: string, numUnits?: number): void;
    addBizCalendarTrend<N extends keyof Tables[T]>(fieldName?: N, bizCalendarSysId?: string): void;
    addBizCalendarTrendBase<N extends keyof Tables[T]>(fieldName?: N, bizCalendarSysId?: string): void;
    groupBy<N extends keyof Tables[T]>(name?: N): void;
    orderByAggregate<N extends keyof Tables[T]>(agg?: string, name?: N): void;
    orderBy<N extends keyof Tables[T]>(name?: N): void;
    orderByDesc<N extends keyof Tables[T]>(name?: N): void;
    getTotal<N extends keyof Tables[T]>(agg?: string, name?: N): number;
    getAggregate<N extends keyof Tables[T]>(agg?: string, name?: N): string;
    getValue<N extends keyof Tables[T]>(name?: N): string;
}
declare interface GlideAggregateㅤ {
    new <T extends keyof Tables>(table?: T): ㅤGlideAggregate<T> & Tables[T];
}
declare const GlideAggregate: GlideAggregateㅤ = ㅤGlideAggregate;
declare class GlideQueryCondition<T extends keyof Tables> extends GlideQueryConditionGenerated {
    addOrCondition<N extends keyof Tables[T], V extends Tables[T][N]>(name?: N, oper?: string, value?: V): GlideQueryCondition<T>;
    addCondition<N extends keyof Tables[T], V extends Tables[T][N]>(name?: N, oper?: string, value?: V): GlideQueryCondition<T>;
}
declare interface gs extends GlideSystem, GlideSystemUserSession, GlideSystemDateUtil2, GlideSystemDateUtil3, GlideSystemScheduleUtil, GlideSystemLoader, GlideSystemUtilDB, GlideSystemUtilScript, GlideSystemUtilXML, GlideSystemLogger {
}
;
declare const gs: gs;
