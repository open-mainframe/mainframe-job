"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ftp = require("ftp");
const Promise = require("promise");
const getRawBody = require("raw-body");
/**
 * The JobEntrySubsystem class supports submitting JCL jobs to JES on IBM mainframes using FTP
 *
 * More details: https://www.ibm.com/support/knowledgecenter/en/SSLTBW_2.1.0/com.ibm.zos.v2r1.halu001/autosubmit.htm
 *
 * @example
 * new JobEntrySubSystem({
 *  port: 21,
 *  host:
 * })
 */
class JobEntrySubsystem {
    constructor(connectionOptions) {
        this.connectionOptions = connectionOptions;
    }
    /**
     * Submits JCL to JES from a filepath, NodeJS.ReadableStream, or Buffer object and
     * returns the result as a Promise<Buffer>
     *
     * @param  {string|NodeJS.ReadableStream|Buffer} input
     * @param  {string} remoteFileName
     * @returns Promise<Buffer>
     */
    submitJob(input, remoteFileName) {
        return new Promise((resolve, reject) => {
            const ftpSession = new ftp();
            ftpSession.on("ready", () => {
                ftpSession.ascii((asciiError) => {
                    if (asciiError) {
                        reject(asciiError);
                    }
                    ftpSession.put(input, remoteFileName, (putError) => {
                        if (putError) {
                            reject(putError);
                        }
                        ftpSession.site("FILEtype=JES NOJESGETBYDSN", (siteError, responseText, responseCode) => {
                            if (siteError) {
                                reject(siteError);
                            }
                            ftpSession.get(remoteFileName, (error, stream) => {
                                if (error) {
                                    reject(error);
                                }
                                stream.once("close", () => { ftpSession.end(); });
                                resolve(getRawBody(stream));
                            });
                        });
                    });
                });
            });
            ftpSession.connect(this.connectionOptions);
        });
    }
}
exports.JobEntrySubsystem = JobEntrySubsystem;
