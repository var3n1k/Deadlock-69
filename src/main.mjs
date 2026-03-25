import * as child_process from "node:child_process"

import * as process from "node:process"

import * as path from "node:path"
import * as fs from "node:fs"

import * as url from "node:url"

// execute | write | read | delete | clear
// new | old | base
// adjust | format
// expected | received
// required | optional
// directory | file
// path | domain | extension | name
// list | index

/**
 * @type {Map<string, [[number]]>}
 */
const expectedSoundManifestEventMap = new globalThis.Map([
  ["Abrams.Charge.Cast", [[-5]]],
  ["Abrams.Charge.Wall.Impact", [[0]]],
  ["Abrams.A4.Leap.Cast", [[0]]],
  ["Abrams.A4.Leap.Descend", [[0]]],

  ["Bebop.Uppercut.Hit", [[10]]],
  ["Bebop.StickyBomb.Cast", [[0]]],
  ["Bebop.StickyBomb.Loop", [[0]]],
  ["Bebop.StickyBomb.Detonate", [[0]]],
  ["Bebop.StickyBomb.Explode", [[0]]],
  ["Bebop.Hook.Cast", [[0]]],
  ["Bebop.Hook.Player", [[5]]],
  ["Bebop.Hook.NPC", [[5]]],
  ["Bebop.HyperBeam.Windup", [[3]]],
  ["Bebop.HyperBeam.Loop", [[3]]],
  ["bebop_upgrade_power3_01_hero_3d", [[0]]],
  ["bebop_upgrade_power3_02_hero_3d", [[0]]],
  ["bebop_upgrade_power3_03_hero_3d", [[0]]],
  ["bebop_upgrade_power3_04_hero_3d", [[0]]],
  ["bebop_upgrade_power3_05_hero_3d", [[0]]],
  ["bebop_upgrade_power3_06_hero_3d", [[0]]],
  ["bebop_upgrade_power3_07_hero_3d", [[0]]],
  ["bebop_upgrade_power3_08_hero_3d", [[0]]],
  ["bebop_upgrade_power3_09_hero_3d", [[0]]],
  ["bebop_upgrade_power3_10_hero_3d", [[0]]],

  ["Bookworm.Conjure.Dragon.Cast", [[0]]],
  ["Bookworm.Conjure.Dragon.Impact", [[0]]],

  ["Doorman.CallBell.Detonate", [[-8]]],
  ["Doorman.CallBell.Debuff", [[-5]]],
  ["Doorman.LuggageCart.Hit", [[3]]],
  ["Doorman.LuggageCart.Hit.Ally", [[0]]],
  ["Doorman.Doorway.Open.Door.Red", [[0]]],
  ["Doorman.Doorway.Open.Door.Blue", [[0]]],
  ["Doorman.Doorway.Door.Expire", [[0]]],
  ["Doorman.Hotel.Cast", [[0]]],
  ["Doorman.Hotel.Key.Lp", [[-5]]],
  ["Doorman.Hotel.Victim.Lp", [[0]]],

  ["Astro.A2.BouncePad.Mod.Travel.Lp", [[-5]]],
  ["Holliday.A3.Crackshot.Headshot.Confirm.Player", [[-5]]],
  ["Holliday.A3.Crackshot.Headshot.Confirm.Victim", [[-5]]],
  ["Holliday.A4.Lasso.Capture", [[0]]],

  ["Chrono.KineticCarbine.Charge.Lp", [[5]]],
  ["Chrono.Swap.Activated", [[0]]],

  ["Drifter.Stalkers.Mark.Cast", [[-3]]],
  ["Drifter.Stalkers.Mark.Hit.Hero", [[-3]]],
  ["Drifter.Terror.Cast", [[-3]]],
  ["Drifter.Terror.Victim.Active", [[0]]],
  ["Drifter.Terror.Aura.Enter", [[-10]]],
  ["drifter_use_power4_01_ability_3d", [[0]]],
  ["drifter_use_power4_01_hero_announcer", [[0]]],
  ["drifter_use_power4_01_ult_3d", [[0]]],
  ["drifter_use_power4_02_ability_3d", [[0]]],
  ["drifter_use_power4_02_hero_announcer", [[0]]],
  ["drifter_use_power4_02_ult_3d", [[0]]],
  ["drifter_use_power4_03_ability_3d", [[0]]],
  ["drifter_use_power4_03_hero_announcer", [[0]]],
  ["drifter_use_power4_03_ult_3d", [[0]]],
  ["drifter_use_power4_04_ability_3d", [[0]]],
  ["drifter_use_power4_04_hero_announcer", [[0]]],
  ["drifter_use_power4_04_ult_3d", [[0]]],
  ["drifter_use_power4_05_ability_3d", [[0]]],
  ["drifter_use_power4_05_hero_announcer", [[0]]],
  ["drifter_use_power4_05_ult_3d", [[0]]],
  ["drifter_use_power4_06_ability_3d", [[0]]],
  ["drifter_use_power4_06_hero_announcer", [[0]]],
  ["drifter_use_power4_06_ult_3d", [[0]]],
  ["drifter_use_power4_07_ability_3d", [[0]]],
  ["drifter_use_power4_07_hero_announcer", [[0]]],
  ["drifter_use_power4_07_ult_3d", [[0]]],
  ["drifter_use_power4_08_ability_3d", [[0]]],
  ["drifter_use_power4_08_hero_announcer", [[0]]],
  ["drifter_use_power4_08_ult_3d", [[0]]],
  ["drifter_use_power4_09_ability_3d", [[0]]],
  ["drifter_use_power4_09_hero_announcer", [[0]]],
  ["drifter_use_power4_09_ult_3d", [[0]]],
  ["drifter_use_power4_10_ability_3d", [[0]]],
  ["drifter_use_power4_10_hero_announcer", [[0]]],
  ["drifter_use_power4_10_ult_3d", [[0]]],
  ["drifter_use_power4_11_ability_3d", [[0]]],
  ["drifter_use_power4_11_hero_announcer", [[0]]],
  ["drifter_use_power4_11_ult_3d", [[0]]],
  ["drifter_use_power4_12_ability_3d", [[0]]],
  ["drifter_use_power4_12_hero_announcer", [[0]]],
  ["drifter_use_power4_12_ult_3d", [[0]]],

  ["Dynamo.A1.Stomp.Hit", [[0]]],
  ["Dynamo.A3.Heal.Loop", [[0]]],
  ["Dynamo.Singularity.Lp", [[-5]]],

  ["Familiar.HelpingHands.Cast", [[0]]],
  ["Familiar.Naptime.Channel", [[-3]]],
  ["Familiar.Naptime.Status.Sleep", [[-5]]],
  ["Familiar.Naptime.Status.Wake", [[-3]]],

  ["Forge.Turret.Place", [[-3]]],
  ["Forge.FissureWall.Cast", [[-3]]],
  ["Forge.Rocket.Barrage.Channel.Lp", [[-8]]],

  ["Fencer.Sigil.Cast.Delay", [[-3]]],
  ["Fencer.Riposte.Cast", [[-3]]],
  ["Fencer.Lunge.Cast.Delay", [[-5]]],
  ["Fencer.Super.Slash.Cast", [[5]]],
  ["fencer_use_power4_start_01_ability_3d", [[0]]],
  ["fencer_use_power4_start_01_hero_announcer", [[0]]],
  ["fencer_use_power4_start_01_ult_3d", [[0]]],
  ["fencer_use_power4_start_02_ability_3d", [[0]]],
  ["fencer_use_power4_start_02_hero_announcer", [[0]]],
  ["fencer_use_power4_start_02_ult_3d", [[0]]],
  ["fencer_use_power4_start_03_ability_3d", [[0]]],
  ["fencer_use_power4_start_03_hero_announcer", [[0]]],
  ["fencer_use_power4_start_03_ult_3d", [[0]]],
  ["fencer_use_power4_start_04_ability_3d", [[0]]],
  ["fencer_use_power4_start_04_hero_announcer", [[0]]],
  ["fencer_use_power4_start_04_ult_3d", [[0]]],
  ["fencer_use_power4_start_05_ability_3d", [[0]]],
  ["fencer_use_power4_start_05_hero_announcer", [[0]]],
  ["fencer_use_power4_start_05_ult_3d", [[0]]],
  ["fencer_use_power4_start_06_ability_3d", [[0]]],
  ["fencer_use_power4_start_06_hero_announcer", [[0]]],
  ["fencer_use_power4_start_06_ult_3d", [[0]]],
  ["fencer_use_power4_start_07_ability_3d", [[0]]],
  ["fencer_use_power4_start_07_hero_announcer", [[0]]],
  ["fencer_use_power4_start_07_ult_3d", [[0]]],
  ["fencer_use_power4_start_08_ability_3d", [[0]]],
  ["fencer_use_power4_start_08_hero_announcer", [[0]]],
  ["fencer_use_power4_start_08_ult_3d", [[0]]],
  ["fencer_use_power4_start_09_ability_3d", [[0]]],
  ["fencer_use_power4_start_09_hero_announcer", [[0]]],
  ["fencer_use_power4_start_09_ult_3d", [[0]]],
  ["fencer_use_power4_start_10_ability_3d", [[0]]],
  ["fencer_use_power4_start_10_hero_announcer", [[0]]],
  ["fencer_use_power4_start_10_ult_3d", [[0]]],

  ["Frank.Reanimation.Start", [[5]]],
  ["Frank.Reanimation.Explosion", [[5]]],

  ["Ghost.LifeDrain.Caster.Lp", [[0]]],
  ["Ghost.LifeDrain.Victim.Lp", [[0]]],
  ["Ghost.Blood.Exchange.Cast", [[0]]],

  ["Haze.Finesse.Dagger.Sleep", [[-5]]],
  ["Haze.Finesse.Dagger.Wake", [[-3]]],
  ["Haze.Smoke.Bomb.Modifier.Lp", [[0]]],
  ["Haze.Smoke.Bomb.End", [[0]]],
  ["Haze.BulletFlurry.Modifier.Lp", [[-5]]],

  ["Gigawatt.StormCloud.Lp", [[-5]]],

  ["Kelvin.IcePath.Dur.Lp", [[-8]]],
  ["Kelvin.IceDome.Cast", [[5]]],

  ["Inferno.Incend.Cast", [[0]]],
  ["Inferno.FlameDash.Modifier.Start", [[0]]],
  ["Inferno.FireBomb.Cast", [[3]]],

  ["Ability.Hornet.Leap.Lp", [[-15]]],

  ["MoKrill.Scorn.Cast", [[3]]],
  ["MoKrill.Burrow.Modifier.Start", [[0]]],
  ["MoKrill.Sandblast.Impact", [[0]]],
  ["MoKrill.Combo.Duration.Lp", [[15]]],

  ["Lash.A1.GroundStrike.Explosion", [[-8]]],
  ["Lash.GroundStrike.Hit", [[-8]]],
  ["Lash.Grapple.Cast", [[-8]]],
  ["Lash.A3.Flog.Impact", [[-3]]],
  ["Lash.A4.Death.Slam.Grab", [[0]]],

  ["Magician.CopyUlt.Copied_Lp", [[-8]]],

  ["Mirage.A4.Teleport.Channel", [[3]]],
  ["Mirage.A4.Teleport.Channel.Destination", [[3]]],
  ["Mirage.A4.Teleport.Depart", [[0]]],
  ["Mirage.A4.Teleport.Arrive", [[0]]],

  ["Calico.Ava.Cast", [[-8]]],

  ["Necro.Decree.Cast", [[5]]],

  ["Orion.Charged.Shot.Cast", [[-8]]],
  ["Archer.GuidedArrow.Cast", [[0]]],
  ["Archer.GuidedArrow.Projectile.Lp", [[-5]]],
  ["Archer.GuidedArrow.Impact", [[0]]],

  ["Pocket.Affliction.Cast", [[0]]],
  ["Pocket.Affliction.Debuff.Lp", [[3]]],

  ["Priest.Slugshot.Hit", [[0]]],
  ["Priest.Witching.Hour.Fire", [[3]]],

  ["Punkgoat.Sigil.Slam.Explosion", [[0]]],
  ["Punkgoat.Rising.Ram.Cast.Delay", [[0]]],
  ["Punkgoat.Blasted.Bottle.Smash", [[-5]]],

  ["Ivy.Tether.Buff.Lp", [[-5]]],
  ["Ivy.StoneForm.Cast", [[0]]],
  ["Ivy.AirDrop.Fly.Lp", [[-5]]],
  ["tengu_use_power4_01_ability_3d", [[0]]],
  ["tengu_use_power4_01_hero_announcer", [[0]]],
  ["tengu_use_power4_01_ult_3d", [[0]]],
  ["tengu_use_power4_02_ability_3d", [[0]]],
  ["tengu_use_power4_02_hero_announcer", [[0]]],
  ["tengu_use_power4_02_ult_3d", [[0]]],
  ["tengu_use_power4_03_ability_3d", [[0]]],
  ["tengu_use_power4_03_hero_announcer", [[0]]],
  ["tengu_use_power4_03_ult_3d", [[0]]],
  ["tengu_use_power4_04_ability_3d", [[0]]],
  ["tengu_use_power4_04_hero_announcer", [[0]]],
  ["tengu_use_power4_04_ult_3d", [[0]]],
  ["tengu_use_power4_05_ability_3d", [[0]]],
  ["tengu_use_power4_05_hero_announcer", [[0]]],
  ["tengu_use_power4_05_ult_3d", [[0]]],
  ["tengu_use_power4_06_ability_3d", [[0]]],
  ["tengu_use_power4_06_hero_announcer", [[0]]],
  ["tengu_use_power4_06_ult_3d", [[0]]],
  ["tengu_use_power4_07_ability_3d", [[0]]],
  ["tengu_use_power4_07_hero_announcer", [[0]]],
  ["tengu_use_power4_07_ult_3d", [[0]]],
  ["tengu_use_power4_08_ability_3d", [[0]]],
  ["tengu_use_power4_08_hero_announcer", [[0]]],
  ["tengu_use_power4_08_ult_3d", [[0]]],
  ["tengu_use_power4_09_ability_3d", [[0]]],
  ["tengu_use_power4_09_hero_announcer", [[0]]],
  ["tengu_use_power4_09_ult_3d", [[0]]],
  ["tengu_use_power4_10_ability_3d", [[0]]],
  ["tengu_use_power4_10_hero_announcer", [[0]]],
  ["tengu_use_power4_10_ult_3d", [[0]]],
  ["tengu_use_power4_as_enemy_01_ability_3d", [[0]]],
  ["tengu_use_power4_as_enemy_01_hero_3d", [[0]]],
  ["tengu_use_power4_as_enemy_01_hero_announcer", [[0]]],
  ["tengu_use_power4_as_enemy_01_ult_3d", [[0]]],
  ["tengu_use_power4_as_enemy_02_ability_3d", [[0]]],
  ["tengu_use_power4_as_enemy_02_hero_3d", [[0]]],
  ["tengu_use_power4_as_enemy_02_hero_announcer", [[0]]],
  ["tengu_use_power4_as_enemy_02_ult_3d", [[0]]],
  ["tengu_use_power4_as_enemy_03_ability_3d", [[0]]],
  ["tengu_use_power4_as_enemy_03_hero_3d", [[0]]],
  ["tengu_use_power4_as_enemy_03_hero_announcer", [[0]]],
  ["tengu_use_power4_as_enemy_03_ult_3d", [[0]]],
  ["tengu_use_power4_as_enemy_04_ability_3d", [[0]]],
  ["tengu_use_power4_as_enemy_04_hero_3d", [[0]]],
  ["tengu_use_power4_as_enemy_04_hero_announcer", [[0]]],
  ["tengu_use_power4_as_enemy_04_ult_3d", [[0]]],
  ["tengu_use_power4_as_enemy_05_ability_3d", [[0]]],
  ["tengu_use_power4_as_enemy_05_hero_3d", [[0]]],
  ["tengu_use_power4_as_enemy_05_hero_announcer", [[0]]],
  ["tengu_use_power4_as_enemy_05_ult_3d", [[0]]],
  ["tengu_use_power5_01_ability_3d", [[0]]],
  ["tengu_use_power5_01_ult_3d", [[0]]],
  ["tengu_use_power5_02_ability_3d", [[0]]],
  ["tengu_use_power5_02_ult_3d", [[0]]],
  ["tengu_use_power5_03_ability_3d", [[0]]],
  ["tengu_use_power5_03_ult_3d", [[0]]],
  ["tengu_use_power5_04_ability_3d", [[0]]],
  ["tengu_use_power5_04_ult_3d", [[0]]],
  ["tengu_use_power5_05_ability_3d", [[0]]],
  ["tengu_use_power5_05_ult_3d", [[0]]],

  ["Shiv.Flash.Leap", [[0]]],
  ["Shiv.Flash.Impact_Kill", [[5]]],

  ["Unicorn.Dazzling.Orb.Cast", [[0]]],
  ["Unicorn.Dazzling.Orb.World.Impact", [[-999]]],
  ["Unicorn.Dazzling.Orb.Hit", [[5]]],

  ["Viper.A3.Slide.Lp", [[5]]],
  ["Viper.Petrify.Debuff_Lp", [[3]]],

  ["VampireBat.Rake.Hit.Confirm", [[0]]],
  ["VampireBat.Blink.Travel.Lp", [[5]]],
  ["VampireBat.Nox.Nostra.Channel.Lp", [[5]]],

  ["Viscous.Cube.Cast", [[-8]]],
  ["Viscous.GooBowlingBall.Movement_Lp", [[-5]]],

  ["Warden.LockDown.Hit", [[-5]]],
  ["Warden.RiotProtocol.PreCast", [[0]]],
  ["Warden.RiotProtocol.Lp", [[0]]],

  ["Werewolf.Boot.Kick.Hit", [[-5]]],
  ["Werewolf.Lycan.Curse.Ready.Warning", [[-8]]],
  ["Werewolf.Lycan.Curse.Cast", [[-8]]],
  ["Werewolf.Lycan.Curse.Ending.Warning", [[-8]]],

  ["Wraith.CardTrick.Proc", [[-8]]],

  ["Yamato.A1.PowerSlash.Cast", [[-10]]],
  ["Yamato.A1.PowerSlash.Cast.Max", [[-10]]],
  ["Yamato.A2.FlyingStrike.Jump", [[-3]]],
  ["Yamato.A4.ShadowForm.Delay", [[-5]]],
  ["Yamato.A4.ShadowForm.Cast", [[-5]]],


  ["Menu.Party.NewMember", [[-3]]],
  ["Menu.Party.Leave", [[-3]]],


  ["Music.MatchIntro.Connecting", [[10]]],

  ["Music.MatchIntro.HeroReveal", [[0]]],

  ["Music.MatchIntro.MatchStart.Mother", [[-8]]],
  ["Music.MatchIntro.MatchStart.King", [[-8]]],


  ["Player.CornerBoostWallJump", [[0]]],

  ["BouncePad.Activate", [[3]]],

  ["Gameplay.World.Zipline.Speed.Boost.Start", [[0]]],

  ["Teleport.Buildup", [[5]]],


  ["Damage.Receive.Melee", [[8]]],

  ["Ability.Melee.Impact.NPC", [[8]]],
  ["Ability.Melee.Impact.Player", [[8]]],
  ["Ability.Melee.Impact.Heavy.Player", [[8]]],

  ["Player.Melee.Parry.Shared", [[0]]],
  ["Player.Melee.Parry.Success.Shared", [[0]]],

  ["PlayerAlert.LowHealth", [[0]]],

  ["Stinger.Death", [[3]]],


  ["Vault.Idle_Lp", [[-3]]],
  ["Vault.Active_Lp", [[-3]]],


  ["Rejuv.Pickup", [[5]]],

  ["Rejuv.Rebirth.Start", [[0]]],
  ["Rejuv.Rebirth.Revive", [[0]]],

  ["MidBoss.Arrive", [[5]]],
  ["MidBoss.LowHealth", [[5]]],
  ["MidBoss.Death", [[5]]],
]);
/**
 * @type {Map<string, boolean>}
 */
const receivedSoundManifestEventMap = new globalThis.Map([]);

/**
 * @param {string} domainPath
 * @returns {[string[], [string, string | (null | undefined)] | (null | undefined)]}
 */
function adjustDomainPath(domainPath) {
  const [file, ...directoryDomainPath] = [...domainPath.split(/[\\\/]+/g)].reverse();
  const directoryPath = [...directoryDomainPath].reverse();

  const fileDomainList = file.split(/[\.]+/g);

  /**
   * @type {string[][]}
   */
  const fileExtensionList = [].map((_el, _ind, _arr) => _el.split(/[\.]+/g));

  /**
   * @type {string | (null | undefined)}
   */
  let fileExtension;
  /**
   * @type {string}
   */
  let fileName;

  fileExtensionList.map((_el, _ind, _arr) => {
    if (_el.every((__el, __ind, __arr) => _el[__ind] === fileDomainList[(fileDomainList.length - _el.length) + __ind]) && fileDomainList.length > _el.length) {
      fileExtension = _el.join(".");
      fileName = fileDomainList.slice(0, fileDomainList.length - _el.length).join(".");
    }
  });

  if ((fileExtension === null || fileExtension === void null) && (fileName === null || fileName === void null)) {
    const [newFileExtension, ...newFileDomainList] = [...fileDomainList].reverse();
    const newFileName = [...newFileDomainList].reverse().join(".");

    fileExtension = newFileExtension;
    fileName = newFileName;

    if (newFileDomainList.length === 0) {
      fileExtension = null;
      fileName = newFileExtension;
    }
  }

  const newDomainPath = [directoryPath, [fileName, fileExtension]];

  if (fs.existsSync(formatDomainPath(newDomainPath, null))) {
    const newDomainPathStat = fs.statSync(formatDomainPath(newDomainPath, null), {});

    if (newDomainPathStat.isDirectory()) {
      return [[...directoryPath, fileName], null];
    }
    if (newDomainPathStat.isFile()) {
      return [directoryPath, [fileName, fileExtension]];
    }
  }

  return newDomainPath;
}

/**
 * @param {[string[], [string, string | (null | undefined)] | (null | undefined)]} domainPath
 * @param {'\\' | '/' | (null | undefined)} pathSeparator
 * @returns {string}
 */
function formatDomainPath(domainPath, pathSeparator) {
  const [directoryPath, fileDomainPath] = domainPath;

  /**
   * @type {string[]}
   */
  const newDomainPath = [];

  newDomainPath.push(...directoryPath);

  if (fileDomainPath !== null && fileDomainPath !== void null) {
    const [fileName, fileExtension] = fileDomainPath;

    newDomainPath.push([
      ...((fileName !== null && fileName !== void null) ? [fileName] : [globalThis.String()]),
      ...((fileExtension !== null && fileExtension !== void null) ? [fileExtension] : []),
    ].join("."));
  }

  return newDomainPath.join((pathSeparator !== null && pathSeparator !== void null) ? pathSeparator : path.sep);
}

/**
 * @param {string[]} directoryPath
 * @returns {Promise<[string[], [string, string | (null | undefined)]][]>}
 */
async function readDirectory(directoryPath) {
  return new globalThis.Promise((resolve, reject) => {
    fs.readdir(formatDomainPath([directoryPath, null], null), {
      recursive: false,
    }, async (err, files) => {
      if (err !== null && err !== void null) {
        reject(err);

        return;
      }

      /**
       * @type {[string[], [string, string | (null | undefined)]][]}
       */
      const fileList = [];

      for (const file of files.map((_el, _ind, _arr) => _el.toString())) {
        const fileDomainPath = [directoryPath, [file, null]];

        const fileStat = fs.statSync(formatDomainPath(fileDomainPath, null), {});
        if (fileStat.isDirectory()) {
          fileList.push(...(await readDirectory([...directoryPath, file])));

          continue;
        }

        const [_, [fileName, fileExtension]] = adjustDomainPath(file);

        fileList.push([directoryPath, [fileName, fileExtension]]);
      }

      resolve(fileList);

      return;
    });
  });
}
/**
 * @param {string[]} directoryPath
 * @returns {Promise<void>}
 */
async function writeDirectory(directoryPath) {
  return new globalThis.Promise((resolve, reject) => {
    for (let i = 0; i < directoryPath.length; i++) {
      const expectedDirectoryPath = formatDomainPath([directoryPath.slice(0, i + 1), null], null);

      if (!fs.existsSync(expectedDirectoryPath)) {
        fs.mkdirSync(expectedDirectoryPath, {});
      }
    }

    resolve();
  });
}

/**
 * @param {string[]} directoryPath
 * @returns {Promise<void>}
 */
async function clearDirectory(directoryPath) {
  return new globalThis.Promise((resolve, reject) => {
    fs.readdir(formatDomainPath([directoryPath, null], null), {
      recursive: false,
    }, async (err, files) => {
      if (err !== null && err !== void null) {
        reject(err);

        return;
      }

      for (const file of files.map((_el, _ind, _arr) => _el.toString())) {
        const fileDomainPath = [directoryPath, [file, null]];

        const fileStat = fs.statSync(formatDomainPath(fileDomainPath, null), {});
        if (fileStat.isDirectory()) {
          await clearDirectory([...directoryPath, file]);

          continue;
        }
      }

      fs.readdir(formatDomainPath([directoryPath, null], null), {
        recursive: false,
      }, async (err, files) => {
        if (err !== null && err !== void null) {
          reject(err);

          return;
        }

        if (files.length === 0) {
          fs.rmdirSync(formatDomainPath([directoryPath, null], null), {});
        }

        resolve();

        return;
      });
    });
  });
}

/**
 * @param {[string[], [string, string | (null | undefined)]]} fileDomainPath
 * @returns {Promise<string>}
 */
async function readFile(fileDomainPath) {
  return new globalThis.Promise((resolve, reject) => {
    fs.readFile(formatDomainPath(fileDomainPath, null), {
      encoding: "utf-8",
    }, (err, data) => {
      if (err !== null && err !== void null) {
        reject(err);

        return;
      }

      resolve(data);

      return;
    });
  });
}
/**
 * @param {[string[], [string, string | (null | undefined)]]} fileDomainPath
 * @param {string} fileContent
 * @returns {Promise<void>}
 */
async function writeFile(fileDomainPath, fileContent) {
  return new globalThis.Promise(async (resolve, reject) => {
    const [directoryPath, [fileName, fileExtension]] = fileDomainPath;

    await writeDirectory(directoryPath);

    fs.writeFile(formatDomainPath(fileDomainPath, null), fileContent, {
      encoding: "utf-8",
    }, (err) => {
      if (err !== null && err !== void null) {
        reject(err);

        return;
      }

      resolve();

      return;
    });
  });
}

/**
 * @param {[string[], [string, string | (null | undefined)]]} fileDomainPath
 * @returns {Promise<void>}
 */
async function deleteFile(fileDomainPath) {
  return new globalThis.Promise((resolve, reject) => {
    fs.rm(formatDomainPath(fileDomainPath, null), (err) => {
      if (err !== null && err !== void null) {
        reject(err);

        return;
      }

      resolve();

      return;
    });
  });
}

/**
 * @param {string} fileName
 * @returns {[string, (fileIndex: number, maxFileIndex: number) => string]}
 */
function adjustFileName(fileName) {
  /**
   * @type {string | (null | undefined)}
   */
  const baseFileName = (() => {
    {
      const fileNameExec = /(?<=^)([_\-]*[\d]+)(?=$)/g.exec(fileName);
      if (globalThis.Array.isArray(fileNameExec)) {
        return null;
      }
    }

    {
      const fileNameExec = /(?<=^)(.*(?:[^_\-]))(?=[_\-]+[\d]+$)/g.exec(fileName);
      if (globalThis.Array.isArray(fileNameExec)) {
        return fileNameExec[1];
      }
    }

    {
      const fileNameExec = /(?<=^)(.*(?:[^_\-\d]))(?=[\d]+$)/g.exec(fileName);
      if (globalThis.Array.isArray(fileNameExec)) {
        return fileNameExec[1];
      }
    }

    return fileName;
  })();

  /**
   * @param {number} fileIndex
   * @param {number} maxFileIndex
   * @returns {string}
   */
  const formatFileName = (fileIndex, maxFileIndex) => [
    ...((baseFileName !== null && baseFileName !== void null) ? [baseFileName] : []),
    fileIndex.toString().padStart(globalThis.Math.max(2, globalThis.Math.floor(globalThis.Math.log10(maxFileIndex)) + 1), 0..toString()),
  ].join("_");

  return [(baseFileName !== null && baseFileName !== void null) ? baseFileName : formatFileName(1, globalThis.Math.pow(10, 2) - 1), formatFileName];
}

/**
 * @param {[string[], [string, string | (null | undefined)]][]} fileList
 * @returns {Map<string, [[string, (fileIndex: number, maxFileIndex: number) => string], [string, string | (null | undefined)][]]>}
 */
function collectFileList(fileList) {
  /**
   * @type {Map<string, [[string, (fileIndex: number, maxFileIndex: number) => string], [string, string | (null | undefined)][]]>}
   */
  const newFileList = new globalThis.Map();

  for (const file of fileList) {
    const [directoryPath, [fileName, fileExtension]] = file;
    const [baseFileName, formatFileName] = adjustFileName(fileName);

    const baseFile = formatDomainPath([directoryPath, [baseFileName, null]], null);

    newFileList.set(baseFile, newFileList.has(baseFile) ? newFileList.get(baseFile) : [[baseFileName, formatFileName], []]);
    newFileList.get(baseFile)[1].push([fileName, fileExtension]);
  }

  return newFileList;
}

/**
 * @param {number} packageIndex
 */
async function main(packageIndex) {
  const libDirectoryPath = ["lib"];

  /**
   * @param {boolean} isCompiled
   * @returns {string[]}
   */
  const addonDirectoryPath = (isCompiled) => [...(isCompiled ? ["game"] : ["content"]), "csgo_addons", "build"];

  const [sourceDirectoryPath, [sourceFileName, sourceFileExtension]] = adjustDomainPath(path.relative(process.cwd(), url.fileURLToPath(import.meta.url, {})));
  const buildDirectoryPath = ["build"];

  const soundeventsDirectoryPath = ["soundevents"];
  const soundeventsHeroDirectoryPath = [...soundeventsDirectoryPath, "hero"];

  const soundsDirectoryPath = ["sounds"];
  const soundsAbilitiesDirectoryPath = [...soundsDirectoryPath, "abilities"];

  const packageDirectoryPath = [[`pak${packageIndex}`, `dir`].join("_")];

  /**
   * @type {string[]}
   */
  const audioFileExtensionList = ["wav"];

  /**
   * @param {string | (null | undefined)} fileExtension
   * @returns {string | (null | undefined)}
   */
  const fileExtensionMap = (fileExtension) =>
    audioFileExtensionList.includes(fileExtension)
      ? "vsnd"
      : fileExtension;

  /**
   * @param {number} logLevel
   * @param {string} logTag
   * @param {string} logMessage
   * @param {unknown} logPayload
   * @returns {void}
   */
  const log = (logLevel, logTag, logMessage, logPayload) => console.log(`${`[${logTag}]`.padStart(10, " ")}${globalThis.String().padStart(logLevel * 3, " ")}${[
    logMessage,
    ...((logPayload !== null && logPayload !== void null) ? [globalThis.String(logPayload)] : []),
  ].join(`:${globalThis.String().padStart(1, " ")}`)}`);

  /**
   * @param {string} logMessage
   * @returns {void}
   */
  const logPending = (logMessage) => log(1, globalThis.String().padStart(3, "."), logMessage, null);

  /**
   * @param {number} logLevel
   * @param {string} logMessage
   * @param {unknown} logPayload
   * @returns {void}
   */
  const logSuccess = (logLevel, logMessage, logPayload) => log(logLevel, globalThis.String().padStart(1, "✓"), logMessage, logPayload);
  /**
   * @param {number} logLevel
   * @param {string} logMessage
   * @param {unknown} logPayload
   * @returns {void}
   */
  const logFailure = (logLevel, logMessage, logPayload) => log(logLevel, globalThis.String().padStart(1, "✗"), logMessage, logPayload);

  /**
   * @param {number} logLevel
   * @param {string} logMessage
   * @param {unknown} logPayload
   * @returns {void}
   */
  const logWarning = (logLevel, logMessage, logPayload) => log(logLevel, globalThis.String().padStart(1, "!"), logMessage, logPayload);

  const refreshDirectory = async () => {
    await globalThis.Promise.all(
      [addonDirectoryPath(false), addonDirectoryPath(true)].map((_el, _ind, _arr) => writeDirectory([...libDirectoryPath, ..._el]))
    );

    await globalThis.Promise.all(
      [soundeventsHeroDirectoryPath, soundsAbilitiesDirectoryPath].map((_el, _ind, _arr) => writeDirectory([...sourceDirectoryPath, ..._el]))
    );

    await globalThis.Promise.all(
      [packageDirectoryPath].map((_el, _ind, _arr) => writeDirectory([...buildDirectoryPath, ..._el]))
    );
  };

  logPending("Refreshing directory");
  await refreshDirectory();
  logSuccess(1, "Directory refreshed", null);

  logPending("Searching for old build files");
  const oldBuildFileList = [
    ...(await readDirectory([...buildDirectoryPath])),

    ...(await readDirectory([...libDirectoryPath, ...addonDirectoryPath(false)])),
    ...(await readDirectory([...libDirectoryPath, ...addonDirectoryPath(true)])),
  ];
  logSuccess(1, "Found old build file(-s)", `${oldBuildFileList.length}`);

  logPending("Deleting old build files");
  await globalThis.Promise.all(oldBuildFileList.map((_el, _ind, _arr) => deleteFile(_el)));
  await clearDirectory([...buildDirectoryPath]);
  logSuccess(1, "Deleted old build file(-s)", `${oldBuildFileList.length}`);

  logPending("Searching for hero sound manifests");
  const heroFileList = (await readDirectory([...sourceDirectoryPath, ...soundeventsHeroDirectoryPath]))
    .filter(([heroDirectoryPath, [heroFileName, heroFileExtension]], _ind, _arr) => {
      const isShared =
        formatDomainPath([heroDirectoryPath, null], null)
          === formatDomainPath([[...sourceDirectoryPath, ...soundeventsHeroDirectoryPath], null], null)
          && heroFileName === "_shared";

      return !isShared;
    });
  logSuccess(1, "Found hero sound manifest(-s)", `${heroFileList.length}`);

  logPending("Reading hero sound manifests");
  const heroFileContentList = (await globalThis.Promise.all(heroFileList.map((_el, _ind, _arr) => readFile(_el))))
    .map((_el, _ind, _arr) => {
      /**
       * @type {string[]}
       */
      const heroSoundsAbilitiesList = [];

      const heroSoundsAbilitiesRegExp = new globalThis.RegExp(`(?<=\")(?:${[...soundsAbilitiesDirectoryPath, "(.*)"].join("\\\/")})(?=\")`, "gm");
      /**
       * @returns {RegExpExecArray | (null | undefined)}
       */
      const heroSoundsAbilitiesExec = () => heroSoundsAbilitiesRegExp.exec(_el);

      let receivedHeroSoundsAbilitiesExec = heroSoundsAbilitiesExec();
      while (globalThis.Array.isArray(receivedHeroSoundsAbilitiesExec)) {
        heroSoundsAbilitiesList.push(receivedHeroSoundsAbilitiesExec[1]);

        receivedHeroSoundsAbilitiesExec = heroSoundsAbilitiesExec();
      }

      return heroSoundsAbilitiesList;
    }).filter((_el, _ind, _arr) => _el.length > 0);
  const heroFileContentSoundList = heroFileContentList.reduce((_prev, _curr, _currInd, _currArr) => [..._prev, ..._curr], []);
  const heroFileContentSoundGroupList = collectFileList(heroFileContentSoundList.map((_el, _ind, _arr) => {
    const [directoryPath, [fileName, fileExtension]] = adjustDomainPath(_el);

    return [[...sourceDirectoryPath, ...soundsAbilitiesDirectoryPath, ...directoryPath], [fileName, fileExtension]];
  }));
  logSuccess(1, "Read hero sound manifest(-s)", `${heroFileList.length} (${heroFileContentList.length})`);
  logSuccess(2, "Found hero sound file(-s)", `${heroFileContentSoundList.length} (${heroFileContentSoundGroupList.size})`);

  logPending("Searching for old (deprecated) hero sound files");
  /**
   * @type {[string[], [string, string | (null | undefined)]][]}
   */
  const oldSoundsAbilitiesFileList = globalThis.Array.from(collectFileList(await readDirectory([...sourceDirectoryPath, ...soundsAbilitiesDirectoryPath])).entries())
    .filter(([key, [[baseFileName, formatFileName], value]], _ind, _arr) => !heroFileContentSoundGroupList.has(key))
    .map(([key, [[baseFileName, formatFileName], value]], _ind, _arr) => {
      const [directoryPath, [, ]] = adjustDomainPath(key);

      return value.map(([fileName, fileExtension], _ind, _arr) => [directoryPath, [fileName, fileExtension]]);
    })
    .reduce((_prev, _curr, _currInd, _currArr) => [..._prev, ..._curr], []);
  logSuccess(1, "Found old (deprecated) hero sound file(-s)", `${oldSoundsAbilitiesFileList.length}`);

  logPending("Deleting old (deprecated) hero sound files");
  await globalThis.Promise.all(oldSoundsAbilitiesFileList.map((_el, _ind, _arr) => deleteFile(_el)));
  await clearDirectory([...sourceDirectoryPath, ...soundsAbilitiesDirectoryPath]);
  logSuccess(1, "Deleted old (deprecated) hero sound file(-s)", `${oldSoundsAbilitiesFileList.length}`);

  logPending("Refreshing directory");
  await refreshDirectory();
  logSuccess(1, "Directory refreshed", null);

  logPending("Searching for existing sound files to rename (adjust)");
  /**
   * @type {[[string[], [string, string | (null | undefined)]], [string[], [string, string | (null | undefined)]]][]}
   */
  const expectedSoundsFileList = (await globalThis.Promise.all(globalThis.Array.from(collectFileList(await readDirectory([...sourceDirectoryPath, ...soundsDirectoryPath])).entries())
    .map(async ([key, [[baseFileName, formatFileName], value]], _ind, _arr) => {
      const [directoryPath, [fileName, fileExtension]] = adjustDomainPath(key);

      const isReal = value.some(([fileName, fileExtension], _ind, _arr) => audioFileExtensionList.includes(fileExtension));

      /**
       * @type {[string, string | (null | undefined)][]}
       */
      const requiredFileList = [];
      /**
       * @type {[string, string | (null | undefined)][]}
       */
      const optionalFileList = [];

      for (const [fileName, fileExtension] of value) {
        if (isReal) {
          if (!audioFileExtensionList.includes(fileExtension)) {
            optionalFileList.push([fileName, fileExtension]);

            await deleteFile([directoryPath, [fileName, fileExtension]]);

            continue;
          }
        }

        requiredFileList.push([fileName, fileExtension]);
      }

      const formatFileNameList = globalThis.Array.from(globalThis.Array(requiredFileList.length), (_el, _ind) => formatFileName(_ind + 1, requiredFileList.length));

      /**
       * @type {[string, string | (null | undefined)][]}
       */
      const expectedFileList = [];
      /**
       * @type {[string, string | (null | undefined)][]}
       */
      const receivedFileList = [];

      for (const [fileName, fileExtension] of requiredFileList) {
        if (formatFileNameList.includes(fileName)) {
          receivedFileList.push([fileName, fileExtension]);

          continue;
        }

        expectedFileList.push([fileName, fileExtension]);
      }

      const expectedFileNameList = formatFileNameList.filter((_el, _ind, _arr) => !receivedFileList.map(([fileName, fileExtension], __ind, __arr) => fileName).includes(_el));

      return [
        ...receivedFileList
          .filter(([fileName, fileExtension], _ind, _arr) => (fileExtension !== null && fileExtension !== void null) && !audioFileExtensionList.includes(fileExtension))
          .map(([fileName, fileExtension], _ind, _arr) => {
          return [
            [directoryPath, [fileName, null]],
            [directoryPath, [fileName, fileExtension]],
          ];
        }),

        ...expectedFileList
          .map(([fileName, fileExtension], _ind, _arr) => {
          return [
            [
              directoryPath,
              [
                expectedFileNameList[_ind],
                ((fileExtension !== null && fileExtension !== void null) && !audioFileExtensionList.includes(fileExtension)) ? null : fileExtension,
              ],
            ],
            [directoryPath, [fileName, fileExtension]],
          ];
        }),
      ];
    })))
    .reduce((_prev, _curr, _currInd, _currArr) => [..._prev, ..._curr], []);
  logSuccess(1, "Found existing sound file(-s) to rename (adjust)", `${expectedSoundsFileList.length}`);

  logPending("Renaming (adjusting) existing sound files");
  await globalThis.Promise.all(expectedSoundsFileList.map(([expected, received], _ind, _arr) => {
    return new globalThis.Promise((resolve, reject) => {
      fs.rename(formatDomainPath(received, null), formatDomainPath(expected, null), (err) => {
        if (err !== null && err !== void null) {
          reject(err);

          return;
        }

        resolve();

        return;
      });
    });
  }));
  logSuccess(1, "Renamed (adjusted) existing sound file(-s)", `${expectedSoundsFileList.length}`);

  logPending("Searching for hero sound files to create (synchronize)");
  const soundsAbilitiesFileList = collectFileList(await readDirectory([...sourceDirectoryPath, ...soundsAbilitiesDirectoryPath]));
  /**
   * @type {[string[], [string, string | (null | undefined)]][]}
   */
  const newSoundsAbilitiesFileList = globalThis.Array.from(heroFileContentSoundGroupList.entries())
    .filter(([key, [[baseFileName, formatFileName], value]], _ind, _arr) => !soundsAbilitiesFileList.has(key))
    .map(([key, [[baseFileName, formatFileName], value]], _ind, _arr) => {
      const [directoryPath, [fileName, fileExtension]] = adjustDomainPath(key);

      return [directoryPath, [formatFileName(1, globalThis.Math.pow(10, 2) - 1), fileExtension]];
    });
  logSuccess(1, "Found hero sound file(-s) to create (synchronize)", `${newSoundsAbilitiesFileList.length}`);

  logPending("Creating new (synchronizing) hero sound files");
  await globalThis.Promise.all(newSoundsAbilitiesFileList.map((_el, _ind, _arr) => writeFile(_el, globalThis.String())));
  logSuccess(1, "Created new (synchronized) hero sound file(-s)", `${newSoundsAbilitiesFileList.length}`);

  logPending("Searching for sound files");
  /**
   * @type {Map<string, [[string, (fileIndex: number, maxFileIndex: number) => string], [string, string | (null | undefined)][]]>}
   */
  const soundFileList = new globalThis.Map(globalThis.Array.from(collectFileList(await readDirectory([...sourceDirectoryPath, ...soundsDirectoryPath])).entries())
    .map(([key, [[baseFileName, formatFileName], value]], _ind, _arr) => {
      const [directoryPath, [fileName, fileExtension]] = adjustDomainPath(path.relative(formatDomainPath([sourceDirectoryPath, null], null), key));

      return [
        formatDomainPath([directoryPath, [baseFileName, null]], null),
        [
          [baseFileName, formatFileName],
          value
            .filter(([fileName, fileExtension], _ind, _arr) => audioFileExtensionList.includes(fileExtension))
            .map(([fileName, fileExtension], _ind, _arr) => [directoryPath, [fileName, fileExtension]]),
        ],
      ];
    })
    .filter(([key, [[baseFileName, formatFileName], value]], _ind, _arr) => value.length > 0));
  logSuccess(1, "Found sound file(-s)", `${globalThis.Array.from(soundFileList.values()).reduce((_prev, [[, ], _curr], _currInd, _currArr) => [..._prev, ..._curr], []).length} (${soundFileList.size})`);

  /**
   * @type {[string[], [string, string]][]}
   */
  const newSoundFileList = [];

  logPending("Generating sound manifests");
  /**
   * @type {[string[], [string, string]][]}
   */
  const newSoundManifestList = (await globalThis.Promise.all((await readDirectory([...sourceDirectoryPath, ...soundeventsDirectoryPath])).filter(([directoryPath, [fileName, fileExtension]], _ind, _arr) => !["vrman"].includes(fileExtension)).map(async (_el, _ind, _arr) => {
    const [directoryPath, [fileName, fileExtension]] = _el;
    const [baseFileName, formatFileName] = adjustFileName(fileName);

    const fileContent = await readFile(_el);

    /**
     * @param {unknown} fileContentValue
     * @returns {string | (null | undefined)}
     */
    const fileContentStringify = (fileContentValue) => {
      if (typeof fileContentValue === "boolean") {
        return globalThis.String(fileContentValue);
      }

      if (typeof fileContentValue === "symbol") {
        return fileContentStringify(fileContentValue.description);
      }
      if (typeof fileContentValue === "string") {
        return `"${globalThis.String(fileContentValue)}"`;
      }

      if (typeof fileContentValue === "number") {
        return fileContentValue.toFixed(6);
      }
      if (typeof fileContentValue === "bigint") {
        return fileContentStringify(globalThis.Number(fileContentValue));
      }

      if (typeof fileContentValue === "object") {
        if (globalThis.Array.isArray(fileContentValue)) {
          return [
            "[",
            ...fileContentValue.map((_el, _ind, _arr) => 
              `${fileContentStringify(_el)},`.split(/[\n]+/g).map((__el, __ind, __arr) => 
                `${globalThis.String().padStart(1, "\t")}${__el}`
              ).join("\n")
            ),
            "]",
          ].join("\n");
        }

        return [
          "{",
          ...[
            ...globalThis.Object.getOwnPropertySymbols(fileContentValue).map((_el, _ind, _arr) => _el.description),
            ...globalThis.Object.getOwnPropertyNames(fileContentValue).map((_el, _ind, _arr) => _el),
          ].filter((_el, _ind, _arr) => typeof _el === "string").map((_el, _ind, _arr) => 
            `${_el.split(/[\.]+/g).map((__el, __ind, __arr) => ["-"].some((___el, ___ind, ___arr) => __el.includes(___el)) ? `"${__el}"` : `${__el}`).join(".")} = ${[
              ...((typeof fileContentValue[_el] === "object") ? [globalThis.String()] : []),
              fileContentStringify(fileContentValue[_el]),
            ].join("\n")}`.split(/[\n]+/g).map((__el, __ind, __arr) => 
              `${globalThis.String().padStart(1, "\t")}${__el}`
            ).join("\n")
          ),
          "}",
        ].join("\n");
      }

      return null;
    };

    /**
     * @param {unknown[]} valueList
     * @returns {string}
     */
    const escapeRegExp = (valueList) => valueList.map((_el, _ind, _arr) => `\\${globalThis.String(_el)}`).join(globalThis.String());

    const spaceRegExp = new globalThis.RegExp(`[^${escapeRegExp(["S"])}]`, "gm");

    /**
     * @param {number} groupIndex
     * @returns {RegExp}
     */
    const variableRegExp = (groupIndex) => new globalThis.RegExp(`((?:[${escapeRegExp(["\"", "\'"])}])?)([${escapeRegExp(["w", "-"])}]+)((?:${escapeRegExp([groupIndex])}))`, "gm");

    const fileContentRegExp = new globalThis.RegExp(`^(\\{(?:(?:${spaceRegExp.source})|(?:${"."}))*\\})$`, "gm");

    const fileContentExec = fileContentRegExp.exec(fileContent);
    if (globalThis.Array.isArray(fileContentExec)) {
      const [fileContentValue, [fileContentStartIndex, fileContentEndIndex]] = [fileContentExec[1], [fileContentExec.index, fileContentExec.index + fileContentExec[0].length]];
      const [fileContentPrefix, fileContentSuffix] = [fileContent.substring(0, fileContentStartIndex), fileContent.substring(fileContentEndIndex, fileContent.length)];

      const fileContentJSON = globalThis.JSON.parse(
        fileContentValue
          .replace(
            new globalThis.RegExp(`((?:${variableRegExp(2).source})(?:(?:(?:${escapeRegExp(["."])})(?:${variableRegExp(5).source}))*))(?:${spaceRegExp.source}*)(?:${escapeRegExp(["="])})`, "gm"),
            (match, group_1, group_2, group_3, group_4, group_5, group_6, group_7) => `,"${group_1.replace(new globalThis.RegExp(`(?:${variableRegExp(1).source})`, "gm"), `$${2}`)}":`,
          )
          .replace(new globalThis.RegExp(`(?:${spaceRegExp.source}+)`, "gm"), globalThis.String().padStart(1, " "))
          .replace(new globalThis.RegExp(`(?<=(?:[${escapeRegExp(["{", "["])}]))(?:${spaceRegExp.source}*)(?:${escapeRegExp([","])})`, "gm"), globalThis.String())
          .replace(new globalThis.RegExp(`(?:${escapeRegExp([","])})(?:${spaceRegExp.source}*)(?=(?:[${escapeRegExp(["}", "]"])}]))`, "gm"), globalThis.String())
      );

      let isFileContentJSON = false;
      for (const soundEventName in fileContentJSON) {
        const soundEvent = fileContentJSON[soundEventName];

        /**
         * @type {string[]}
         */
        const soundEventPropertyNameDynamicPrefixList = [];
        for (const soundEventPropertyName in soundEvent) {
          const [soundEventPropertyNameSuffix, ...soundEventPropertyNameDomainList] = [...soundEventPropertyName.split(/[\.]+/g)].reverse();
          const [soundEventPropertyNamePrefix, ...soundEventPropertyNameDomainPath] = [...soundEventPropertyNameDomainList].reverse();

          const [baseSoundEventPropertyNamePrefix, formatSoundEventPropertyNamePrefix] = adjustFileName(soundEventPropertyNamePrefix);

          const soundEventProperty = soundEvent[soundEventPropertyName];

          if (
            baseSoundEventPropertyNamePrefix === "track"
            && audioFileExtensionList
              .map((_el, _ind, _arr) => fileExtensionMap(_el))
              .filter((_el, _ind, _arr) => !_arr.slice(0, _ind).includes(_el))
              .some((_el, _ind, _arr) => soundEventPropertyNameSuffix === [_el, "selection", "type"].join("_"))
            && soundEventProperty === "index"
          ) {
            if (soundEventPropertyNamePrefix === [baseSoundEventPropertyNamePrefix, 1].join("_")) {
              soundEventPropertyNameDynamicPrefixList.push(null, void null);
            }

            soundEventPropertyNameDynamicPrefixList.push(soundEventPropertyNamePrefix);
          }
        }

        let isSoundEvent = false;
        for (const soundEventPropertyName in soundEvent) {
          const [soundEventPropertyNameSuffix, ...soundEventPropertyNameDomainList] = [...soundEventPropertyName.split(/[\.]+/g)].reverse();
          const [soundEventPropertyNamePrefix, ...soundEventPropertyNameDomainPath] = [...soundEventPropertyNameDomainList].reverse();

          if (typeof soundEvent[soundEventPropertyName] === "string"
            && soundEvent[soundEventPropertyName].startsWith(formatDomainPath([[...soundsDirectoryPath, globalThis.String()], null], "/"))) {
            soundEvent[soundEventPropertyName] = [soundEvent[soundEventPropertyName]];
          }

          const soundEventProperty = soundEvent[soundEventPropertyName];

          if (globalThis.Array.isArray(soundEventProperty)) {
            if (
              soundEventProperty.every((_el, _ind, _arr) =>
                typeof _el === "string"
                && _el.startsWith(formatDomainPath([[...soundsDirectoryPath, globalThis.String()], null], "/")))
            ) {
              for (const [key, [[baseFileName, formatFileName], value]] of globalThis.Array.from(collectFileList(soundEventProperty.map((_el, _ind, _arr) => adjustDomainPath(_el))).entries())) {
                const [directoryPath, [fileName, fileExtension]] = adjustDomainPath(key);

                /**
                 * @type {[string[], [string, string]][]}
                 */
                const expectedNewSoundFileList = [];

                if (soundFileList.has(formatDomainPath([directoryPath, [baseFileName, null]], null))) {
                  const [[, ], [...expectedSoundFileList]] = soundFileList.get(formatDomainPath([directoryPath, [baseFileName, null]], null));
                  const expectedSoundFileListCapacity = expectedSoundFileList.length;

                  while (expectedSoundFileList.length < value.length) {
                    expectedSoundFileList.push(...expectedSoundFileList.slice(0, expectedSoundFileListCapacity));
                  }

                  value.map(([fileName, fileExtension], _ind, _arr) => {
                    if (soundEventProperty.includes(formatDomainPath([directoryPath, [fileName, fileExtension]], "/"))) {
                      const [expectedDirectoryPath, [expectedFileName, expectedFileExtension]] = expectedSoundFileList[_ind];

                      if (soundEventPropertyNameDynamicPrefixList.includes(soundEventPropertyNamePrefix)) {
                        soundEvent[soundEventPropertyName] = soundEventProperty.with(
                          soundEventProperty.findIndex((__el, __ind, __arr) => __el === formatDomainPath([directoryPath, [fileName, fileExtension]], "/")),
                          formatDomainPath([expectedDirectoryPath, [expectedFileName, fileExtensionMap(expectedFileExtension)]], "/"),
                        );

                        expectedNewSoundFileList.push([expectedDirectoryPath, [expectedFileName, expectedFileExtension]]);

                        return;
                      }

                      soundEventProperty.splice(
                        soundEventProperty.findIndex((__el, __ind, __arr) => __el === formatDomainPath([directoryPath, [fileName, fileExtension]], "/")),
                        1,
                      );
                    }
                  });

                  if (!soundEventPropertyNameDynamicPrefixList.includes(soundEventPropertyNamePrefix)) {
                    soundEventProperty.push(
                      ...expectedSoundFileList.slice(0, expectedSoundFileListCapacity)
                        .map(([expectedDirectoryPath, [expectedFileName, expectedFileExtension]], _ind, _arr) => {
                          expectedNewSoundFileList.push([expectedDirectoryPath, [expectedFileName, expectedFileExtension]]);

                          return formatDomainPath([expectedDirectoryPath, [expectedFileName, fileExtensionMap(expectedFileExtension)]], "/");
                        })
                    );
                  }

                  isSoundEvent = true;
                }

                newSoundFileList.push(
                  ...expectedNewSoundFileList.filter((_el, _ind, _arr) =>
                    !newSoundFileList.map((__el, __ind, __arr) =>
                      formatDomainPath(__el, null)).includes(formatDomainPath(_el, null)))
                );
              }
            }
          }
        }

        if (isSoundEvent) {
          receivedSoundManifestEventMap.set(soundEventName, expectedSoundManifestEventMap.has(soundEventName));

          if (!expectedSoundManifestEventMap.has(soundEventName)) {
            logWarning(2, "Found unconfigured sound event", soundEventName);
          }

          soundEvent["volume"] = globalThis.Math.max(0, soundEvent["volume"] ?? 0) + 5;

          if (expectedSoundManifestEventMap.has(soundEventName)) {
            const [[soundEventVolume]] = expectedSoundManifestEventMap.get(soundEventName);

            soundEvent["volume"] += soundEventVolume;
          }

          for (const soundEventPropertyName in soundEvent) {
            if (
              [
                ["type"],

                ["base"],

                ["mixer", "mixgroup"],
                ["mix", "group", "prefix"],

                ["context", "name"],

                ["event", "use", "music", "convar"],

                ["position"],

                ["volume"],

                // ["delay"],
              ].map((_el, _ind, _arr) => _el.join("_")).includes(soundEventPropertyName)
              || [
                ["play", "from"],

                ["send"],
                ["block"],

                ["position"],

                ...audioFileExtensionList
                  .map((_el, _ind, _arr) => fileExtensionMap(_el))
                  .filter((_el, _ind, _arr) => !_arr.slice(0, _ind).includes(_el))
                  .map((_el, _ind, _arr) => [[`${_el}`], [`${_el}s`]])
                  .reduce((_prev, _curr, _currInd, _currArr) => [..._prev, ..._curr], []),
              ].some((_el, _ind, _arr) => soundEventPropertyName.startsWith([..._el, globalThis.String()].join("_")))
              || [
                ["layer"],

                ...audioFileExtensionList
                  .map((_el, _ind, _arr) => fileExtensionMap(_el))
                  .filter((_el, _ind, _arr) => !_arr.slice(0, _ind).includes(_el))
                  .map((_el, _ind, _arr) => [[`${_el}`], [`${_el}s`]])
                  .reduce((_prev, _curr, _currInd, _currArr) => [..._prev, ..._curr], []),
              ].some((_el, _ind, _arr) => soundEventPropertyName.endsWith([globalThis.String(), ..._el].join("_")))
              || [
                ["track"],
              ].some((_el, _ind, _arr) => {
                const [soundEventPropertyNameSuffix, ...soundEventPropertyNameDomainList] = [...soundEventPropertyName.split(/[\.]+/g)].reverse();
                const [soundEventPropertyNamePrefix, ...soundEventPropertyNameDomainPath] = [...soundEventPropertyNameDomainList].reverse();

                const [baseSoundEventPropertyNamePrefix, formatSoundEventPropertyNamePrefix] = adjustFileName(soundEventPropertyNamePrefix);

                return baseSoundEventPropertyNamePrefix === _el.join("_");
              })
              || [

              ].some((_el, _ind, _arr) => {
                const [soundEventPropertyNameSuffix, ...soundEventPropertyNameDomainList] = [...soundEventPropertyName.split(/[\.]+/g)].reverse();
                const [soundEventPropertyNamePrefix, ...soundEventPropertyNameDomainPath] = [...soundEventPropertyNameDomainList].reverse();

                const [baseSoundEventPropertyNameSuffix, formatSoundEventPropertyNameSuffix] = adjustFileName(soundEventPropertyNameSuffix);

                return baseSoundEventPropertyNameSuffix === _el.join("_");
              })
            ) {
              continue;
            }

            delete soundEvent[soundEventPropertyName];
          }
        }

        if (isSoundEvent) {
          isFileContentJSON = isSoundEvent;
        }
      }

      if (isFileContentJSON) {
        const newFileContentValue = [fileContentPrefix, fileContentStringify(fileContentJSON), fileContentSuffix].join(globalThis.String());

        const [newDirectoryPath, [, ]] = adjustDomainPath(path.relative(
          formatDomainPath([sourceDirectoryPath, null], null),
          formatDomainPath([directoryPath, [fileName, fileExtension]], null),
        ));

        await writeFile([[...libDirectoryPath, ...addonDirectoryPath(false), ...newDirectoryPath], [fileName, fileExtension]], newFileContentValue);

        return [newDirectoryPath, [fileName, fileExtension]];
      }
    }

    return null;
  }))).filter((_el, _ind, _arr) => (_el !== null && _el !== void null));
  globalThis.Array.from(expectedSoundManifestEventMap.keys())
    .map((_el, _ind, _arr) => {
      if (!receivedSoundManifestEventMap.has(_el) || !receivedSoundManifestEventMap.get(_el)) {
        logWarning(3, "Found unused sound event", _el);
      }
    });
  logSuccess(1, "Generated sound manifest(-s)", `${newSoundManifestList.length}`);
  logSuccess(2, "Used sound file(-s)", `${newSoundFileList.length} / ${globalThis.Array.from(soundFileList.values()).reduce((_prev, [[, ], _curr], _currInd, _currArr) => [..._prev, ..._curr], []).length}`);
  globalThis.Array.from(soundFileList.values()).reduce((_prev, [[, ], _curr], _currInd, _currArr) => [..._prev, ..._curr], [])
    .map((_el, _ind, _arr) => {
      if (!newSoundFileList.map((__el, __ind, __arr) => formatDomainPath(__el, null)).includes(formatDomainPath(_el, null))) {
        logWarning(3, "Found unused sound file", formatDomainPath(_el, "/"));
      }
    });

  logPending("Copying sound files");
  await globalThis.Promise.all(
    newSoundFileList.map(([directoryPath, [fileName, fileExtension]], _ind, _arr) => {
      return new globalThis.Promise(async (resolve, reject) => {
        const oldDirectoryPath = [...sourceDirectoryPath, ...directoryPath];
        const newDirectoryPath = [...libDirectoryPath, ...addonDirectoryPath(false), ...directoryPath];

        await writeDirectory(newDirectoryPath);

        fs.copyFile(
          formatDomainPath([oldDirectoryPath, [fileName, fileExtension]], null),
          formatDomainPath([newDirectoryPath, [fileName, fileExtension]], null),
          (err) => {
            if (err !== null && err !== void null) {
              reject(err);

              return;
            }

            resolve();

            return;
          },
        );
      });
    })
  );
  logSuccess(1, "Copied sound file(-s)", `${newSoundFileList.length}`);

  logPending("Compiling source files");
  await new globalThis.Promise((resolve, reject) => {
    child_process.spawn(
      `"${path.join(process.cwd(), formatDomainPath([[...libDirectoryPath, "game", "bin", "win64"], ["resourcecompiler", "exe"]], null))}"`,
      [
        ["i", [`"${path.join(process.cwd(), formatDomainPath([[...libDirectoryPath, ...addonDirectoryPath(false)], ["*", "*"]], null))}"`]],
        ["r", []],
        ["f", []],
      ].map(([optionName, optionParameterList], _ind, _arr) => [
        ...(((optionName !== null && optionName !== void null)) ? [`-${optionName}`] : []),
        ...optionParameterList,
      ].join(globalThis.String().padStart(1, " "))),
      {
        shell: true,

        cwd: process.cwd(),

        stdio: [process.stdin, "ignore", process.stderr],
      }
    )
      .once("error", (err) => {
        reject(err);
      })
      .once("exit", (code, signal) => {
        resolve();
      })
      .once("close", (code, signal) => {
        resolve();
      });
  });
  logSuccess(1, "Compiled source file(-s)", null);

  logPending("Copying build files");
  /**
   * @type {([string[], [string, string]]|[string[], [string, string]])[]}
   */
  const newBuildFileList = await globalThis.Promise.all(
    [...newSoundFileList, ...newSoundManifestList].map(([directoryPath, [fileName, fileExtension]], _ind, _arr) => {
      return new globalThis.Promise(async (resolve, reject) => {
        fileExtension = [fileExtensionMap(fileExtension), "c"].join("_");

        const oldDirectoryPath = [...libDirectoryPath, ...addonDirectoryPath(true), ...directoryPath];
        const newDirectoryPath = [...buildDirectoryPath, ...packageDirectoryPath, ...directoryPath];

        await writeDirectory(newDirectoryPath);

        fs.copyFile(
          formatDomainPath([oldDirectoryPath, [fileName, fileExtension]], null),
          formatDomainPath([newDirectoryPath, [fileName, fileExtension]], null),
          (err) => {
            if (err !== null && err !== void null) {
              reject(err);

              return;
            }

            resolve([directoryPath, [fileName, fileExtension]]);

            return;
          },
        );
      });
    })
  );
  logSuccess(1, "Copied build file(-s)", `${newBuildFileList.length}`);

  logPending("Packing build files");
  await new globalThis.Promise((resolve, reject) => {
    child_process.spawn(
      `"${path.join(process.cwd(), formatDomainPath([[...libDirectoryPath, "game", "csgo", "import_scripts", "bin"], ["vpk", "exe"]], null))}"`,
      [
        ["M", []],
        ["c", [100]],
        [null, [`"${path.join(process.cwd(), formatDomainPath([[...buildDirectoryPath, ...packageDirectoryPath], null], null))}"`]],
      ].map(([optionName, optionParameterList], _ind, _arr) => [
        ...(((optionName !== null && optionName !== void null)) ? [`-${optionName}`] : []),
        ...optionParameterList,
      ].join(globalThis.String().padStart(1, " "))),
      {
        shell: true,

        cwd: process.cwd(),

        stdio: [process.stdin, "ignore", process.stderr],
      }
    )
      .once("error", (err) => {
        reject(err);
      })
      .once("exit", (code, signal) => {
        resolve();
      })
      .once("close", (code, signal) => {
        resolve();
      });
  });
  logSuccess(1, "Packed build file(-s)", null);

  console.log(globalThis.String().padStart(3, "\n"));

  const newBuildSoundList = newBuildFileList.filter(([directoryPath, [fileName, fileExtension]], _ind, _arr) =>
    formatDomainPath([directoryPath, null], null)
      .startsWith(formatDomainPath([soundsDirectoryPath, null], null)));
  const newBuildHeroSoundList = newBuildSoundList.filter(([directoryPath, [fileName, fileExtension]], _ind, _arr) =>
    formatDomainPath([directoryPath, null], null)
      .startsWith(formatDomainPath([soundsAbilitiesDirectoryPath, null], null)));;

  const newBuildSoundManifestList = newBuildFileList.filter(([directoryPath, [fileName, fileExtension]], _ind, _arr) =>
    formatDomainPath([directoryPath, null], null)
      .startsWith(formatDomainPath([soundeventsDirectoryPath, null], null)));
  const newBuildHeroSoundManifestList = newBuildSoundManifestList.filter(([directoryPath, [fileName, fileExtension]], _ind, _arr) =>
    formatDomainPath([directoryPath, null], null)
      .startsWith(formatDomainPath([soundeventsHeroDirectoryPath, null], null)));;

  logSuccess(1, "Replaced sound file(-s)", `${newBuildSoundList.length} (${collectFileList(newBuildSoundList).size})`);
  logSuccess(2, "Replaced hero sound file(-s)", `${newBuildHeroSoundList.length} (${collectFileList(newBuildHeroSoundList).size})`);
  logSuccess(1, "Patched sound manifest(-s)", newBuildSoundManifestList.length);
  logSuccess(2, "Patched hero sound manifest(-s)", `${newBuildHeroSoundManifestList.length} (${newBuildHeroSoundManifestList
    .map(([directoryPath, [fileName, fileExtension]], _ind, _arr) =>
      fileName.split(/[]{0}/g).map((__el, __ind, __arr) => __ind === 0 ? __el.toUpperCase() : __el).join(globalThis.String())
    ).join(", ")})`
  );
}

main(69);
