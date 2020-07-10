import { Driver } from "./Driver";
import { hash } from "../util/StringUtils";

    /**
 * Common driver utility functions.
 */
export class DriverUtils {

    // -------------------------------------------------------------------------
    // Public Static Methods
    // -------------------------------------------------------------------------

    /**
     * Normalizes and builds a new driver options.
     * Extracts settings from connection url and sets to a new options object.
     */
    static buildDriverOptions(options: any, buildOptions?: { useSid: boolean }): any {
        if (options.url) {
            const parsedUrl = this.parseConnectionUrl(options.url);
            let urlDriverOptions: any = {
                type: parsedUrl.type,
                host: parsedUrl.host,
                username: parsedUrl.username,
                password: parsedUrl.password,
                port: parsedUrl.port,
                database: parsedUrl.database
            };
            if (buildOptions && buildOptions.useSid) {
                urlDriverOptions.sid = parsedUrl.database;
            }
            return Object.assign({}, urlDriverOptions, options);
        }
        return Object.assign({}, options);
    }

    /**
     * Builds column alias from given alias name and column name.
     * 
     * If alias length is greater than the limit (if any) allowed by the current
     * driver, replaces it with a hashed string.
     *
     * @param driver Current `Driver`.
     * @param alias Alias part.
     * @param column Name of the column to be concatened to `alias`.
     *
     * @return An alias allowing to select/transform the target `column`.
     */
    static buildColumnAlias({ maxAliasLength }: Driver, alias: string, column: string): string {
        const columnAliasName = alias + "_" + column;

        if (maxAliasLength && maxAliasLength > 0 && columnAliasName.length > maxAliasLength) {
            return hash(columnAliasName, { length: maxAliasLength });
        }

        return columnAliasName;
    }

    // -------------------------------------------------------------------------
    // Private Static Methods
    // -------------------------------------------------------------------------

    /**
     * Extracts connection data from the connection url.
     *  expected format is: 
     *  postgres://{user}:{password}@{hostname}:{port}/{database-name}
     */
    private static parseConnectionUrl(url: string) {
        try {
          const firstSlashes = url.indexOf("//");
          const preBase = url.substr(firstSlashes + 2);
          const lastSlash = preBase.lastIndexOf("/");
          const base = (lastSlash !== -1) ? preBase.substr(0, lastSlash) : preBase;
          console.log('base', base)
          const afterBase = (lastSlash !== -1) ? preBase.substr(lastSlash + 1) : undefined;
          const [usernameAndPassword, hostAndPort] = base.split("@");
          const [username, password] = usernameAndPassword.split(":");
          const [host, port] = hostAndPort.split(":");

          return {
              host: host,
              username: username,
              password: password,
              port: port ? parseInt(port) : undefined,
              database: afterBase || undefined
          };
        } catch (e) {
          throw new Error('malformed connection string')
        }
    }
}
