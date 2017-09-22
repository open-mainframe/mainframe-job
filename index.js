"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ftp = require("ftp");
const getRawBody = require("raw-body");
/**
 * The JobEntrySubsystem class supports submitting JCL jobs to JES on IBM mainframes using FTP
 *
 * More details: https://www.ibm.com/support/knowledgecenter/en/SSLTBW_2.1.0/com.ibm.zos.v2r1.halu001/autosubmit.htm
 *
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
                this.setAscii(ftpSession)
                    .then(() => {
                    return this.put(ftpSession, input, remoteFileName);
                })
                    .then(() => {
                    return this.site(ftpSession, "FILEtype=JES NOJESGETBYDSN");
                })
                    .then((responseText) => {
                    return this.get(ftpSession, remoteFileName);
                })
                    .then((buffer) => {
                    return resolve(buffer);
                })
                    .catch((error) => {
                    console.error(error);
                });
            });
            ftpSession.connect(this.connectionOptions);
        });
    }
    setAscii(ftpSession) {
        return new Promise((resolve, reject) => {
            ftpSession.ascii((asciiError) => {
                if (asciiError) {
                    reject(asciiError);
                }
                return resolve();
            });
        });
    }
    put(ftpSession, input, remoteFileName) {
        return new Promise((resolve, reject) => {
            ftpSession.put(input, remoteFileName, (putError) => {
                if (putError) {
                    reject(putError);
                }
                return resolve();
            });
        });
    }
    site(ftpSession, command) {
        return new Promise((resolve, reject) => {
            ftpSession.site(command, (siteError, responseText, responseCode) => {
                if (siteError) {
                    reject(siteError);
                }
                return resolve(responseText);
            });
        });
    }
    get(ftpSession, remoteFileName) {
        return new Promise((resolve, reject) => {
            ftpSession.get(remoteFileName, (error, stream) => {
                if (error) {
                    reject(error);
                }
                stream.once("close", () => { ftpSession.end(); });
                getRawBody(stream)
                    .then((buffer) => {
                    resolve(buffer);
                });
            });
        });
    }
}
exports.JobEntrySubsystem = JobEntrySubsystem;
