import * as child_process from "node:child_process"

import * as process from "node:process"

import * as path from "node:path"
import * as fs from "node:fs"

import * as stream from "node:stream"

import * as url from "node:url"

import * as util from "./util.mjs"

import * as steam from "./steam.mjs"

/**
 * @param {string} gitHubUserName
 * @param {string} gitHubRepositoryName
 * @returns {Promise<[[string, string | (null | undefined)], [[string, string], string], URL][]>}
 */
export async function getGitHubAssetList(gitHubUserName, gitHubRepositoryName) {
  /**
   * @type {[[string, string | (null | undefined)], [[string, string], string], URL][]}
   */
  const gitHubAssetList = [];

  util.logPending(`Searching for latest release of "${gitHubRepositoryName}" (${gitHubUserName})`);
  const gitHubRelease = await globalThis.fetch(new globalThis.URL(`https://github.com/${gitHubUserName}/${gitHubRepositoryName}/releases/latest`), {
    method: "GET",

    headers: {},
    body: null,
  });
  if (!gitHubRelease.ok) {
    util.logFailure(1, `Can't find latest release of "${gitHubRepositoryName}" (${gitHubUserName})`, null);

    return gitHubAssetList;
  }

  const gitHubReleaseURLDomainPath = new globalThis.URL(gitHubRelease.url).pathname.split("/");

  const gitHubTag = gitHubReleaseURLDomainPath[gitHubReleaseURLDomainPath.length - 1];
  util.logSuccess(1, `Found latest release of "${gitHubRepositoryName}" (${gitHubUserName})`, `"${gitHubTag}"`);

  util.logPending(`Searching for public assets for release "${gitHubTag}" of "${gitHubRepositoryName}" (${gitHubUserName})`);
  const gitHubReleaseAssetList = await globalThis.fetch(new globalThis.URL(`https://github.com/${gitHubUserName}/${gitHubRepositoryName}/releases/expanded_assets/${gitHubTag}`), {
    method: "GET",

    headers: {},
    body: null,
  });
  if (!gitHubReleaseAssetList.ok) {
    util.logFailure(2, `Can't find public assets for release "${gitHubTag}" of "${gitHubRepositoryName}" (${gitHubUserName})`, null);

    return gitHubAssetList;
  }

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

  const gitHubReleaseAssetListManifest = await gitHubReleaseAssetList.text();
  const gitHubReleaseAssetListManifestRegExp = new globalThis.RegExp(
    `(?:href)(?:${escapeRegExp(["="])})(?:${escapeRegExp(["\""])}(?:${escapeRegExp(["/"])})(${globalThis.RegExp.escape(`${gitHubUserName}/${gitHubRepositoryName}/releases/download/${gitHubTag}/`)}((?:${variableRegExp(3).source})(?:(?:(?:${escapeRegExp(["."])})(?:${variableRegExp(6).source}))*)))${escapeRegExp(["\""])})`,
    "gm",
  );

  let gitHubReleaseAssetListManifestExec;
  while (globalThis.Array.isArray(gitHubReleaseAssetListManifestExec = gitHubReleaseAssetListManifestRegExp.exec(gitHubReleaseAssetListManifest))) {
    const [directoryPath, [fileName, fileExtension]] = util.adjustDomainPath(gitHubReleaseAssetListManifestExec[2]);

    gitHubAssetList.push([
      [fileName, fileExtension],
      [[gitHubUserName, gitHubRepositoryName], gitHubTag],
      new globalThis.URL(`https://github.com/${gitHubReleaseAssetListManifestExec[1]}`),
    ]);
  }

  util.logSuccess(2, `Found public asset(-s) for release "${gitHubTag}" of "${gitHubRepositoryName}" (${gitHubUserName})`, [
    gitHubAssetList.length,
    ...(gitHubAssetList.length > 0
      ? [
        `(${gitHubAssetList.map(([
          [fileName, fileExtension],
          [[gitHubUserName, gitHubRepositoryName], gitHubTag],
          fileURL,
        ], _ind, _arr) => util.formatDomainPath([[], [fileName, fileExtension]], null)).join(",".padEnd(2, " "))})`,
      ]
      : []),
  ].join(globalThis.String().padStart(1, " ")));

  return gitHubAssetList;
}

/**
 * @param {[string, string][]} sourceList
 */
async function main(sourceList) {
  util.logPending("Searching for installed steam games");
  const steamGameMap = await steam.getSteam();
  util.logSuccess(1, "Found installed steam game(-s)", steamGameMap.size);

  util.logPending("Checking game presence");
  if (!steamGameMap.has(1422450)) {
    util.logFailure(1, "Game is not installed", null);

    return;
  }
  const [[steamGameId, steamGameName], [steamGameIsReady, steamGameLaunch], steamGameDirectoryDomainPath] = steamGameMap.get(1422450);
  if (!steamGameIsReady()) {
    util.logFailure(1, "Game is not ready", null);

    return;
  }
  util.logSuccess(1, "Game is ready", null);

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

  const gitHubAssetListRegExp = new globalThis.RegExp(`(?<=^(?:pak))([${escapeRegExp(["d"])}]+)(?=(?:.*)$)`, "gm");

  /**
   * @type {Map<number, [[string, string | (null | undefined)], [[string, string], string], URL][]>}
   */
  const gitHubAssetList = new globalThis.Map([]);

  util.logPending("Collecting addon assets");
  for (const source of sourceList) {
    /**
     * @type {number[]}
     */
    const fileIndexList = [];

    for (const [
      [fileName, fileExtension],
      [[gitHubUserName, gitHubRepositoryName], gitHubTag],
      fileURL,
    ] of await getGitHubAssetList(...source)) {
      const fileNameExec = new globalThis.RegExp(gitHubAssetListRegExp.source, gitHubAssetListRegExp.flags).exec(fileName);
      if (!globalThis.Array.isArray(fileNameExec)) {
        continue;
      }

      if (fileExtension !== "vpk") {
        continue;
      }

      const fileIndex = globalThis.Number.parseInt(fileNameExec[1]);
      if (!fileIndexList.includes(fileIndex)) {
        fileIndexList.push(fileIndex);

        gitHubAssetList.set(fileIndex, []);
      }

      gitHubAssetList.get(fileIndex).push([[fileName, fileExtension], [[gitHubUserName, gitHubRepositoryName], gitHubTag], fileURL]);
    }
  }
  util.logSuccess(1, "Collected addon asset(-s)", gitHubAssetList.size);
  globalThis.Array.from(gitHubAssetList.entries())
    .map(([key, value], _ind, _arr) => {
      util.logSuccess(2, `Addon №${key}`, null);
      value.map(([
        [fileName, fileExtension],
        [[gitHubUserName, gitHubRepositoryName], gitHubTag],
        fileURL,
      ], __ind, __arr) => {
        util.logSuccess(3, util.formatDomainPath([[], [fileName, fileExtension]], null), `"${gitHubTag}" of "${gitHubRepositoryName}" (${gitHubUserName})`);
      });
  });

  util.logPending("Mounting addon assets");
  for (const [key, value] of globalThis.Array.from(gitHubAssetList.entries())) {
    util.logPending(`Mounting addon №${key}`);

    const directoryPath = [...steamGameDirectoryDomainPath, "game", "citadel", "addons"];

    await util.writeDirectory(directoryPath);

    util.logPending(`Searching for old addon files (conflicting with addon №${key})`);
    const oldBuildFileList = [
      ...(await util.readDirectory(directoryPath))
        .filter(([directoryPath, [fileName, fileExtension]], _ind, _arr) => {
          const fileNameExec = new globalThis.RegExp(gitHubAssetListRegExp.source, gitHubAssetListRegExp.flags).exec(fileName);
          if (globalThis.Array.isArray(fileNameExec)) {
            if (key === globalThis.Number.parseInt(fileNameExec[1])) {
              return true;
            }
          }

          return value.map(([
            [fileName, fileExtension],
            [[gitHubUserName, gitHubRepositoryName], gitHubTag],
            fileURL,
          ], __ind, __arr) => fileName).includes(fileName);
        }),
    ];
    util.logSuccess(2, `Found old addon file(-s) (conflicting with addon №${key})`, `${oldBuildFileList.length}`);

    util.logPending(`Deleting old addon files (conflicting with addon №${key})`);
    await globalThis.Promise.all(oldBuildFileList.map((_el, _ind, _arr) => util.deleteFile(_el)));
    await util.clearDirectory(directoryPath);
    util.logSuccess(2, `Deleted old addon file(-s) (conflicting with addon №${key})`, `${oldBuildFileList.length}`);

    await util.writeDirectory(directoryPath);

    util.logPending(`Writing new addon files (downloading from addon №${key})`);
    const newBuildFileList = await globalThis.Promise.all(value.map(async ([
      [fileName, fileExtension],
      [[gitHubUserName, gitHubRepositoryName], gitHubTag],
      fileURL,
    ], _ind, _arr) => {
      const file = await globalThis.fetch(fileURL, {
        method: "GET",

        headers: {},
        body: null,
      });
      if (!file.ok) {
        util.logFailure(3, `Can't download file "${util.formatDomainPath([[], [fileName, fileExtension]], null)}" from release "${gitHubTag}" of "${gitHubRepositoryName}" (${gitHubUserName})`, null);

        return;
      }

      const fileWriteStream = fs.createWriteStream(util.formatDomainPath([directoryPath, [fileName, fileExtension]], null), {
        autoClose: true,

        flush: true,

        highWaterMark: 50_000_000,
      });

      const fileReadStream = stream.Readable.fromWeb(file.body, {
        highWaterMark: 50_000_000,
      });

      await (new globalThis.Promise((resolve, reject) => {
        fileReadStream.pipe(fileWriteStream, {
          end: true,
        })
          .once("error", (err) => {
            reject(err);
          })
          .once("close", () => {
            resolve();
          })
          .once("finish", () => {
            resolve();
          })
          .once("drain", () => {
            resolve();
          });
      }));
      util.logSuccess(3, `Wrote new addon file (downloaded from addon №${key})`, `"${util.formatDomainPath([[], [fileName, fileExtension]], null)}" from release "${gitHubTag}" of "${gitHubRepositoryName}" (${gitHubUserName})`);

      return [directoryPath, [fileName, fileExtension]];
    }));
    util.logSuccess(2, `Wrote new addon file(-s) (downloaded from addon №${key})`, `${newBuildFileList.length}`);

    util.logSuccess(2, `Mounted addon №${key}`, null);
  }
  util.logSuccess(1, "Mounted addon assets", null);

  util.logPending(`Replacing "${util.formatDomainPath([[], ["gameinfo", "gi"]], null)}"`);
  {
    const [directoryPath, [fileName, fileExtension]] = [[...steamGameDirectoryDomainPath, "game", "citadel"], ["gameinfo", "gi"]];

    if (fs.existsSync(util.formatDomainPath([directoryPath, [fileName, fileExtension]], null))) {
      await util.deleteFile([directoryPath, [fileName, fileExtension]]);
    }

    await util.writeFile(
      [directoryPath, [fileName, fileExtension]],
// https://deadlocker.net/install-guide
`"GameInfo"
{
	game 		"citadel"
	title 		"Citadel"
	type		multiplayer_only
	nomodels 1
	nohimodel 1
	nocrosshair 0
	hidden_maps
	{
		"test_speakers"			1
		"test_hardware"			1
	}
	nodegraph 0
	perfwizard 0
	tonemapping 0
	GameData	"citadel.fgd"

	DisallowGameInfoConditionals 1
	PGIVersion "6E09D3ED5A47F6A97443813F0E00F90BAA435918F82DF0C9B5DA46D27A33D903"

	Localize
	{
		DuplicateTokensAssert	1
		DisallowTokenContexts	1
	}

	SupportedLanguages
	{
		"brazilian" "3"
		"czech" "3"
		"english" "3"
		"french" "3"
		"german" "3"
		"italian" "3"
		"indonesian" "3"
		"japanese" "3"
		"koreana" "3"
		"latam" "3"
		"polish" "3"
		"russian" "3"
		"schinese" "3"
		"spanish" "3"
		"thai" "3"
		"turkish" "3"
		"ukrainian" "3"
	}
	
	FileSystem
	{
		//
		// The code that loads this file automatically does a few things here:
		//
		// 1. For each "Game" search path, it adds a "GameBin" path, in <dir>\\bin
		// 2. For each "Game" search path, it adds another "Game" path in front of it with _<language> at the end.
		//    For example: c:\\hl2\\cstrike on a french machine would get a c:\\hl2\\cstrike_french path added to it.
		// 3. If no "Mod" key, for the first "Game" search path, it adds a search path called "MOD".
		// 4. If no "Write" key, for the first "Game" search path, it adds a search path called "DEFAULT_WRITE_PATH".
		//
	
		//
		// Search paths are relative to the exe directory\\..\\
		//
		SearchPaths
		{
			// These are optional language paths. They must be mounted first, which is why there are first in the list.
			// *LANGUAGE* will be replaced with the actual language name. If not running a specific language, these paths will not be mounted
			Game_Language		citadel_*LANGUAGE*
			
			Mod                 citadel
			Write               citadel
			Game                citadel/addons
			Game                citadel
			Mod                 core
			Write               core
			Game                core
			AddonRoot           citadel_addons
			OfficialAddonRoot   citadel_community_addons
		}
	}
	AddonConfig
	{
		"UseOfficialAddons" "1"
	}
	
	MaterialSystem2
	{
		RenderModes
		{
			game Default
			game Forward
			game Deferred
			game Outline
			game Depth
			game FrontDepth

			dev ToolsVis // Visualization modes for all shaders (lighting only, normal maps only, etc.)
			dev ToolsWireframe // This should use the ToolsVis mode above instead of being its own mode\\

			tools ToolsUtil // Meant to be used to render tools sceneobjects that are mod-independent, like the origin grid
		}
	}

	MaterialEditor
	{
		"DefaultShader" "environment_texture_set"
	}

	NetworkSystem
	{
		BetaUniverse
		{
			FakeLag			40
			FakeLoss		.1
			//FakeReorderPct 0.05
			//FakeReorderDelay 10
			//FakeJitter "low"
			// Turning off fake jitter for now while I work on making the CQ totally solid
			FakeReorderPct 0
			FakeReorderDelay 0
			FakeJitter "off"
		}

		"SkipRedundantChangeCallbacks"	"1"
	}

	RenderSystem
	{
		IndexBufferPoolSizeMB 32
		UseReverseDepth 1
		Use32BitDepthBuffer 0
		Use32BitDepthBufferWithoutStencil 0
		SwapChainSampleableDepth 1
		VulkanMutableSwapchain 1
		"LowLatency"								"1"
		"VulkanOnly_Linux"							"1"
		"VulkanRequireSubgroupWaveOpSupport"		"1"
		"VulkanRequireDescriptorIndexing"			"1"
		"VulkanSteamShaderCache" "1"
		"VulkanSteamAppShaderCache" "1"
		"VulkanSteamDownloadedShaderCache" "1"
		"VulkanAdditionalShaderCache" "vulkan_shader_cache.foz"
		"VulkanStagingPMBSizeLimitMB" "384"
		"GraphicsPipelineLibrary"	"1"
		"VulkanOnlyTestProbability" "0"
		"VulkanDefrag"				"1"
		"MinStreamingPoolSizeMB"	"1024"
		"MinStreamingPoolSizeMBTools" "2048"
	}

	NVNGX
	{
		AppID 103371621
		SupportsDLSS 1
	}

	Engine2
	{
		HasModAppSystems 1
		Capable64Bit 1
		URLName citadel
		RenderingPipeline
		{
			SupportsMSAA 0
			DistanceField 1
		}
		PauseSinglePlayerOnGameOverlay 1
		DefensiveConCommands 1
		DisableLoadingPlaque 1
	}

	ContentBuilder
	{
		ResourceCompilerDirectXUsesWARP "0"
	}

	SoundSystem
	{
		SteamAudioEnabled            "1"
		WaveDataCacheSizeMB          "256"
		"UsePlatTime"            "1"
	}
	Sounds
	{
		HierarchicalEncodingFiles	 "1"
	}

	ToolsEnvironment
	{
		"Engine"	"Source 2"
		"ToolsDir"	"../sdktools"	// NOTE: Default Tools path. This is relative to the mod path.
	}
	
	pulse
	{
		"pulse_enabled"					"1"
	}

	Hammer
	{
		"fgd"					"citadel.fgd"	// NOTE: This is relative to the 'game' path.
		"GameFeatureSet"		"Citadel"
		"DefaultSolidEntity"	"trigger_multiple"
		"DefaultPointEntity"	"info_player_start"
		"NavMarkupEntity"		"func_nav_markup"
		"OverlayBoxSize"			"8"
		"TileMeshesEnabled"			"1"
		"RenderMode"				"ToolsVis"
		"CreateRenderClusters"		"1"
		"DefaultMinDrawVolumeSize"	"2048"
		"DefaultMinTrianglesPerCluster"	"16384"
		"TileGridSupportsBlendHeight"	"1"
		"TileGridBlendDefaultColor"	"0 255 0"
		"LoadScriptEntities" "0"
		"UsesBakedLighting" "1"
		"UseAnalyticGrid" "0"
		"SupportsDisplacementMapping" "0"
		"SteamAudioEnabled"				"1"
		"LatticeDeformerEnabled"		"1"
		"ShadowAtlasWidth" "16384"
		"ShadowAtlasHeight" "16384"
		"TimeSlicedShadowMapRendering" "1"
	}

	SoundTool
	{
		"DefaultSoundEventType" "src1_3d"

		SoundEventBaseOptions
		{
			"Base.Announcer.VO.2d" ""
			"Base.World.VO.Emitter.3d" ""
			"Base.Hero.VO.Ping.2d" ""
			"Base.Hero.VO.2d" ""
			"Base.Hero.VO.3d" ""
			"Base.Hero.VO.Ability.3d" ""
			"Base.Hero.VO.Ultimate.3d" ""
			"Base.Hero.VO.Dash.3d" ""
			"Base.Hero.VO.Effort.3d" ""
			"Base.Hero.VO.Pain.3d" ""
			"Base.Hero.VO.Melee.3d" ""
			"Base.Hero.VO.Death.3d" ""
		}
	}

	RenderPipelineAliases
	{
	}

	ResourceCompiler
	{
		// Overrides of the default builders as specified in code, this controls which map builder steps
		// will be run when resource compiler is run for a map without specifiying any specific map builder
		// steps. Additionally this controls which builders are displayed in the hammer build dialog.
		DefaultMapBuilders
		{
			"bakedlighting"	"1"	// Enable lightmapping during compile time		
			"envmap"	"0" // turned off since it currently causes an assert and doesn't work due to some build issue
			"nav"		"1"	// Generate nav mesh data
		}

		MeshCompiler
		{
			OptimizeForMeshlets 1
			TrianglesPerMeshlet 64	// Maximum valid value currently is 126
			UseMikkTSpace 1
			EncodeVertexBuffer 1
            EncodeVertexBufferVersion 1
            EncodeVertexBufferLevel 3
			EncodeIndexBuffer 1
			SplitDepthStream 1
		}

		WorldRendererBuilder
		{
			VisibilityGuidedMeshClustering      "1"
			MinimumTrianglesPerClusteredMesh    "8192"
			MinimumVerticesPerClusteredMesh     "8192"
			MinimumVolumePerClusteredMesh       "8192"       // ~20x20x20 cube
			MaxPrecomputedVisClusterMembership  "96"
			MaxCullingBoundsGroups              "128"
			UseAggregateInstances				"1"
			AggregateInstancingMeshlets			"1"
			BakePropsWithExtraVertexStreams		"1"
		}

		BakedLighting
		{
			Version 4
			ImportanceVolumeTransitionRegion 512            // distance we transition from high to low resolution charts 
			LightmapChannels
			{
				direct_light_shadows 1
				debug_chart_color 1
				directional_irradiance_sh2_dc 1
				
				directional_irradiance_sh2_r
				{
					CompressedFormat DXT1
				}
				
				directional_irradiance_sh2_g
				{
					CompressedFormat DXT1
				}
				
				directional_irradiance_sh2_b
				{
					CompressedFormat DXT1
				}
			}
			LightmapGutterSize 2 // For bicubic filtering
			UseStaticLightProbes 0
			LPVAtlas 1
			BC6HHueShiftFixup 0 // Causes more artifacts than it solves atm
			Repack2 1
		}

		SteamAudio
		{
			ReverbDefaults
			{
				GridSpacing			"3.0"
				HeightAboveFloor	"1.5"
				RebakeOption		"0"						// 0: cleanup, 1: manual, 2: auto
				NumRays				"32768"
				NumBounces			"64"
				IRDuration			"1.0"
				AmbisonicsOrder		"1"
			}
			PathingDefaults
			{
				GridSpacing			"3.0"
				HeightAboveFloor	"1.5"
				RebakeOption		"0"						// 0: cleanup, 1: manual, 2: auto
				NumVisSamples		"1"
				ProbeVisRadius		"0"
				ProbeVisThreshold	"0.1"
				ProbeVisPathRange	"1000.0"
			}
		}
		SoundStackScripts
		{
			CompileStacksStrict "1"
		}
		VisBuilder
		{
			MaxVisClusters "4096"
			PreMergeOpenSpaceDistanceThreshold "128.0"
			PreMergeOpenSpaceMaxDimension "2048.0"
			PreMergeOpenSpaceMaxRatio "8.0"
			PreMergeSmallRegionsSizeThreshold "20.0"
		}

		VDataLocalization
		{
			GameOutputPath	"resource/localization/citadel_vdata"
			TokenPrefix		"Citadel_VData_"
		}
		
		TextureCompiler
		{
			//Compressor              "lz4"
			//CompressMipsOnDisk      "1"
			//CompressMinRatio        "95"
			AllowNP2Textures		"1"
			AllowPanoramaMipGeneration	"1"
			//PublicToolsDefaultMaxRes "2048"
		}
	}

	Source1Import
	{
		// this is just copied from the left4dead3 gameinfo.gi
		"forcevtxfileupconvert" 1
	}

	WorldRenderer
	{
		EnvironmentMaps					1
		EnvironmentMapFaceSize			256
		EnvironmentMapRenderSize		1024
		EnvironmentMapFormat			BC6H
		EnvironmentMapPreviewFormat 		BC6H
		EnvironmentMapColorSpace		linear
		EnvironmentMapMipProcessor		GGXCubeMapBlur
		// Build cubemaps into a cube array instead of individual cubemaps.
		"EnvironmentMapUseCubeArray" 	1
		"EnvironmentMapCacheSizeTools"  300
		BindlessSceneObjectDesc			CitadelBindlessDesc
		GrassCastsShadows				1
	}

	SceneSystem
	{
		GpuLightBinner 1
		FogCachedShadowAtlasWidth 2048
		FogCachedShadowAtlasHeight 2048
		FogCachedShadowTileSize 128
		GpuLightBinnerSunLightFastPath 1
		CSMCascadeResolution 2048
		SunLightManagerCount 0
		SunLightManagerCountTools 0
		DefaultShadowTextureWidth 6144
		DefaultShadowTextureHeight 6144
		DynamicShadowResolution 1

		TransformTextureRowCount	1024
		TransformTextureRowCountToolsMode 6144
		SunLightMaxCascadeSize		4
		SunLightShadowRenderMode	Depth
		LayerBatchThresholdFullsort 20
		NonTexturedGradientFog		1
		// Temp till I can add support in citadel shaders
		DisableLateAllocatedTransformBuffer 1
		MinimumLateAllocatedVertexCacheBufferSizeMB 64
		CubemapFog 1
		VolumetricFog 1
		FrameBufferCopyFormat R11G11B10F
		Tonemapping 0
		
		WellKnownLightCookies
		{
			"blank" "materials/effects/lightcookies/blank.vtex"
			"flashlight" "materials/effects/lightcookies/flashlight.vtex"
		}

		ComputeShaderSkinning 1
	}

	NavSystem
	{
		"NavTileSize" "128.0"
		"NavCellSize" "1.5"
		"NavCellHeight" "2.0"

		// Hull definitions live in scripts/nav_hulls.vdata
		// Preset definitions live in scripts/nav_hulls_presets.vdata
		"NavHullsPreset" "default"

		"NavRegionMinSize" "8"
		"NavRegionMergeSize" "20"
		"NavEdgeMaxLen" "1200"
		"NavEdgeMaxError" "51.0"
		"NavVertsPerPoly" "4"
		"NavDetailSampleDistance" "120.0"
		"NavDetailSampleMaxError" "2.0"
		"NavSmallAreaOnEdgeRemovalSize" "81.0"
	}

	AnimationSystem
	{
		"DisableServerInterpCompensation"	"1"
		"DisableAnimationScript" 	"1"
		"ServerPoseRecipeHistorySize"	"60"
		"ClientPoseRecipeHistorySize"	"60"

	}

	ModelDoc
	{
		"models_gamedata"			"models_gamedata.fgd"
		"features"					"animgraph;modelconfig;gamepreview;wireframe_backfaces;distancefield"
	}

	Particles
	{
		"EnableParticleShaderFeatureBranching"	"1"
		"Float16HDRBackBuffer" "1"
		"PET_SupportFadingOpaqueModels" "1"
		"Features" "non_homogenous_forward_layer_only"
	}

	ConVars
	{	 
		"rate"
		{
			"min"		"98304"
			"default"	"786432"
			"max"		"1000000"
		}
		"sv_minrate"	"98304"
		"sv_maxunlag"	"0.500"
		"sv_maxunlag_player" "0.200"
		"sv_lagcomp_filterbyviewangle" "false"

		// Spew warning when adding/removing classes to/from the top of the hierarchy
		"panorama_classes_perf_warning_threshold_ms" "0.75"

		// Panorama - enable minidumps on JS exceptions
		"panorama_js_minidumps" "1"
		// Enable the render target cache optimization.
		"panorama_disable_render_target_cache" "0"

		// Enable the composition layer optimization
		"panorama_skip_composition_layer_content_paint" "1"

		// too expensive (500MB+) to load this
		"snd_steamaudio_load_reverb_data" "0"
		"snd_steamaudio_load_pathing_data" "0"

		// Steam Audio project specific convars
		"snd_steamaudio_enable_custom_hrtf"		"0"
		"snd_steamaudio_active_hrtf"			"0"
		"snd_steamaudio_reverb_update_rate"		"10.0"
		"snd_steamaudio_ir_duration"			"1.0"
		"snd_steamaudio_enable_pathing"			"0"
		"snd_steamaudio_invalid_path_length"	"0.0"
		"cl_disconnect_soundevent"				"citadel.convar.stop_all_game_layer_soundevents"
		"snd_event_browser_default_stack"		"citadel_default_3d"
		
		// voip
		"voice_in_process"			            "1"

		// Sound debugging
		"snd_report_audio_nan" "1"

		// Audio system settings
		"snd_sos_max_event_base_depth" "10"
		"sos_use_guid_filter" "1"

		"voice_always_sample_mic"               
		{
			"version"	"2"
			"default"	"0"
		}

		"reset_voice_on_input_stallout"         "0"
		"voice_input_stallout"                  "0.5"
		"cl_usesocketsforloopback" "1"
		"cl_poll_network_early" "0"

		// Perf/Parallelism
		"iv_parallel_restore" "1"

		// For perf reasons, since we don't use source-based DSP:
		"disable_source_soundscape_trace"       "1"
		
		// Networking - Induced latency (pred offset)
		"cl_tickpacket_recvmargin_desired" "5" 					// 5 ms base, min. floor for protecting against thrashing the queue
		"cl_tickpacket_desired_queuelength" "0"					// 0 = attempt to always reach the queue's min floor
		"cl_async_usercmd_send_disabled_recvmargin_min" "0.5"	// Additional frame since we do not use the async usercmd send (potentially unneccessary)
		"cl_clock_buffer_ticks"	"1"
		"cl_interp_ratio" "0"
		"cl_async_usercmd_send" "false"

		"fps_max"		"400"
		"fps_max_ui"	"120"

		"in_button_double_press_window" "0.3"

		// Convars that control spatialization of UI audio.
		"snd_ui_positional"								"1"
		"snd_ui_spatialization_spread"					"2.4"
		
		// sound volume rate change limiting
		"snd_envelope_rate"								"100.0"
		"snd_soundmixer_update_maximum_frame_rate" 		"0"

		//don't let people mess with speaker config settings.
		"speaker_config"
		{
			"min"		"0"
			"default"	"0"
			"max"		"2"
		}

		"cq_buffer_bloat_msecs_max" "120"

		"snd_soundmixer"						"Default_Mix"
		"cloth_filter_transform_stateless" "0"

		"cl_joystick_enabled" "0"
		"panorama_joystick_enabled" "0"

		"snd_event_browser_focus_events" "true"

		"cl_max_particle_pvs_aabb_edge_length" "100"
		
		// Allow aggregation of particles (for perf)
		"cl_aggregate_particles" "true"
		
		"citadel_enable_vdata_sound_preload" "true"
	}

	Memory
	{
		"EstimatedMaxCPUMemUsageMB"	"1"
		"EstimatedMinGPUMemUsageMB"	"1"

		"ShowInsufficientPageFileMessageBox" "1"
		"ShowLowAvailableVirtualMemoryMessageBox" "1"
	}
}
`,
    );
  }
  util.logSuccess(1, `Replaced "${util.formatDomainPath([[], ["gameinfo", "gi"]], null)}"`, null);
}

main([
  ["var3n1k", "Deadlock-69"],

  ["KrolTryCode", "deadlock"],
])
  .finally(() => {
    process.stdin.read();
  });
