import * as ftp from "ftp";
import * as Promise from "promise";
import * as getRawBody from "raw-body";
import { Readable } from "stream";

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
export class JobEntrySubsystem {

  constructor(
    public connectionOptions: ftp.Options,
  ) { }

  /**
   * Submits JCL to JES from a filepath, NodeJS.ReadableStream, or Buffer object and
   * returns the result as a Promise<Buffer>
   *
   * @param  {string|NodeJS.ReadableStream|Buffer} input
   * @param  {string} remoteFileName
   * @returns Promise<Buffer>
   */
  public submitJob(
    input: string | NodeJS.ReadableStream | Buffer,
    remoteFileName: string,
  ): Promise<Buffer> {

    return new Promise<Buffer>((resolve, reject) => {
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
          .catch((error) => {
            console.error(error);
          });
      });
      ftpSession.connect(this.connectionOptions);
    });
  }

  private setAscii(ftpSession: ftp): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      ftpSession.ascii((asciiError) => {
        if (asciiError) { reject(asciiError); }
        return resolve();
      });
    });
  }

  private put(
    ftpSession: ftp,
    input: string | NodeJS.ReadableStream | Buffer,
    remoteFileName: string,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      ftpSession.put(input, remoteFileName, (putError: Error) => {
        if (putError) { reject(putError); }
        return resolve();
      });
    });
  }

  private site(
    ftpSession: ftp,
    command: string,
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      ftpSession.site(
        command,
        (siteError: Error, responseText: string, responseCode: number) => {
          if (siteError) { reject(siteError); }
          return resolve(responseText);
        });
    });
  }

  private get(
    ftpSession: ftp,
    remoteFileName: string,
  ): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      ftpSession.get(remoteFileName, (error: Error, stream: Readable) => {
        if (error) { reject(error); }
        stream.once("close", () => { ftpSession.end(); });
        return resolve(getRawBody(stream));
      });
    });
  }
}
